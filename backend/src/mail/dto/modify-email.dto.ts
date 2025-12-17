import { IsArray, IsOptional, IsString } from 'class-validator';

export class ModifyEmailDto {
    @IsArray()
    @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
    @IsOptional()
    addLabels?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    removeLabels?: string[];
}