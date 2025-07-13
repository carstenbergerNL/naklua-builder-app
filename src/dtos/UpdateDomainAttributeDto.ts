export interface UpdateDomainAttributeDto {
  name: string;
  dataType: string;
  length: number;
  isRequired: boolean;
  isPrimaryKey: boolean;
  defaultValue: string;
}