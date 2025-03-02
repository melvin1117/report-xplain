import {
    Controller,
    Post,
    Body,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signup(
        @Body()
        userData: {
            name?: string;
            email: string;
            password: string;
        },
    ) {
        try {
            return await this.authService.signup(userData);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post('login')
    async login(
        @Body() credentials: { email: string; password: string },
    ) {
        try {
            return await this.authService.login(credentials);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }
    }
}
