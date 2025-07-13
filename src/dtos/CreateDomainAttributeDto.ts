export interface CreateDomainAttributeDto {
  entityId: string;
  name: string;
  dataType: string;
  length: number;
  isRequired: boolean;
  isPrimaryKey: boolean;
  defaultValue: string;
  creatorId: string;
}