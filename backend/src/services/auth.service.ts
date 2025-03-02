import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async signup(userData: {
        name?: string;
        email: string;
        password: string;
    }) {
        // Check if a user already exists with the same email
        const existingUser = await this.usersRepo.findOne({
            where: [{ email: userData.email }],
        });
        if (existingUser) {
            throw new HttpException(
                'Email already in use',
                HttpStatus.BAD_REQUEST,
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create and save the new user
        const newUser = this.usersRepo.create({
            name: userData.name,
            email: userData.email,
            password_hash: hashedPassword,
        });

        await this.usersRepo.save(newUser);
        return { message: 'User registered successfully' };
    }

    async login(credentials: { email: string; password: string }) {
        // Find user by email and select the password hash for verification
        const user = await this.usersRepo.findOne({
            where: { email: credentials.email },
            select: ['id', 'name', 'email', 'password_hash'],
        });

        if (!user) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        // Compare provided password with the stored hash
        const isMatch = await bcrypt.compare(
            credentials.password,
            user.password_hash,
        );
        if (!isMatch) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        // Create JWT payload and sign the token
        const payload = { id: user.id, email: user.email };
        const token = this.jwtService.sign(payload, { expiresIn: '6h' });

        return {
            accessToken: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }
}
