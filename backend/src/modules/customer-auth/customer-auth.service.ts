import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { CustomerAccess, CustomerAccessDocument } from '../customer-cabinet/schemas/customer-access.schema';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CustomerRegisterDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class CustomerLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@Injectable()
export class CustomerAuthService {
  private readonly logger = new Logger(CustomerAuthService.name);

  constructor(
    @InjectModel(CustomerAccess.name)
    private readonly accessModel: Model<CustomerAccessDocument>,
    @InjectModel('Customer')
    private readonly customerModel: Model<any>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CustomerRegisterDto) {
    this.logger.log(`Register attempt with: ${JSON.stringify(dto)}`);
    
    if (!dto || !dto.email) {
      throw new BadRequestException('Email є обов\'язковим');
    }
    if (!dto.password || dto.password.length < 6) {
      throw new BadRequestException('Пароль повинен містити мінімум 6 символів');
    }
    
    const email = dto.email.toLowerCase().trim();
    
    // Check if email already exists
    const exists = await this.accessModel.findOne({ email });
    if (exists) {
      throw new BadRequestException('Email вже зареєстровано');
    }

    // Check if customer exists
    let customer: any = await this.customerModel.findOne({
      $or: [{ id: dto.customerId }, { email }],
    }).lean();

    // If no customer, create one
    if (!customer) {
      const nameParts = (dto.name || email.split('@')[0]).split(' ');
      const firstName = nameParts[0] || 'Клієнт';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const newCustomer = await this.customerModel.create({
        id: dto.customerId || uuidv4(),
        email,
        firstName,
        lastName: lastName || firstName,
        phone: '',
        status: 'active',
        source: 'cabinet_registration',
        isDeleted: false,
        createdAt: new Date(),
      });
      customer = newCustomer.toObject();
    }

    const customerId = (customer as any).id || String((customer as any)._id);

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create access record
    const access = await this.accessModel.create({
      id: uuidv4(),
      customerId,
      email,
      passwordHash,
      isActive: true,
      isVerified: false,
      loginCount: 0,
    });

    this.logger.log(`Customer registered: ${email}`);
    return this.buildAuthResponse(access, customer);
  }

  async login(dto: CustomerLoginDto) {
    if (!dto.email || !dto.password) {
      throw new UnauthorizedException('Невірний email або пароль');
    }
    
    const email = dto.email.toLowerCase().trim();
    
    const access = await this.accessModel.findOne({ email });
    if (!access) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    if (!access.isActive) {
      throw new UnauthorizedException('Акаунт деактивовано');
    }

    const isValid = await bcrypt.compare(dto.password, access.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Невірний email або пароль');
    }

    // Update last login
    access.lastLoginAt = new Date();
    access.loginCount = (access.loginCount || 0) + 1;
    await access.save();

    // Get customer data - try by id field first
    let customer: any = await this.customerModel.findOne({ id: access.customerId }).lean();
    
    // Fallback to _id only if it looks like ObjectId
    if (!customer && /^[a-f\d]{24}$/i.test(access.customerId)) {
      customer = await this.customerModel.findById(access.customerId).lean();
    }

    this.logger.log(`Customer logged in: ${email}`);
    return this.buildAuthResponse(access, customer);
  }

  async validateToken(customerId: string): Promise<any> {
    const access = await this.accessModel.findOne({
      customerId,
      isActive: true,
    }).lean();

    if (!access) return null;

    // Get customer - try by id field first
    let customer: any = await this.customerModel.findOne({ id: access.customerId }).lean();
    
    // Fallback to _id only if it looks like ObjectId
    if (!customer && /^[a-f\d]{24}$/i.test(access.customerId)) {
      customer = await this.customerModel.findById(access.customerId).lean();
    }

    return customer;
  }

  async getProfile(customerId: string): Promise<any> {
    const access = await this.accessModel.findOne({
      customerId,
    }).lean();

    if (!access) return null;

    // Get customer - try by id field first
    let customer: any = await this.customerModel.findOne({ id: customerId }).lean();
    
    // Fallback to _id only if it looks like ObjectId
    if (!customer && /^[a-f\d]{24}$/i.test(customerId)) {
      customer = await this.customerModel.findById(customerId).lean();
    }

    return {
      email: access.email,
      isVerified: access.isVerified,
      lastLoginAt: access.lastLoginAt,
      loginCount: access.loginCount,
      customer: customer ? {
        id: customer.id || String(customer._id),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      } : null,
    };
  }

  private buildAuthResponse(access: CustomerAccessDocument, customer: any) {
    const payload = {
      sub: access.customerId,
      email: access.email,
      role: 'customer',
    };

    const customerData = customer as any;

    return {
      accessToken: this.jwtService.sign(payload),
      customerId: access.customerId,
      email: access.email,
      customer: customerData ? {
        id: customerData.id || String(customerData._id),
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
      } : null,
    };
  }
}
