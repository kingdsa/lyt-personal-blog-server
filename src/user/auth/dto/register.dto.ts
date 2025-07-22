import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @Length(3, 20, { message: '用户名长度应在3-20个字符之间' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @Length(6, 20, { message: '密码长度应在6-20个字符之间' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/, {
    message: '密码必须包含至少一个字母和一个数字',
  })
  password: string;

  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsNotEmpty({ message: '昵称不能为空' })
  @IsString({ message: '昵称必须是字符串' })
  @Length(2, 20, { message: '昵称长度应在2-20个字符之间' })
  nickname: string;
}
