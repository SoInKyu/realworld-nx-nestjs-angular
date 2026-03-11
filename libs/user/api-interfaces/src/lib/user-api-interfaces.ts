import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { IBase } from '@realworld/shared/client-server';
// Login
export abstract class ILoginUser {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}

// Register
export abstract class INewUser {
  @MaxLength(60)
  username: string;
  @IsEmail()
  @MaxLength(60)
  email: string;
  @IsNotEmpty()
  @MaxLength(200)
  password: string;
}

// User response
export abstract class IUser extends IBase {
  username: string;
  email: string;
  token: string;
  bio: string;
  image: string;
}

// Update user
export abstract class IUpdateUser {
  @IsOptional()
  @MaxLength(60)
  username: string;
  @IsOptional()
  @IsEmail()
  @MaxLength(60)
  email: string;
  @IsOptional()
  @MaxLength(255)
  password: string;
  @IsOptional()
  @MaxLength(1000)
  bio: string;
  @IsOptional()
  @IsUrl()
  image: string;
}

// Profile
export abstract class IProfile extends IBase {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}
