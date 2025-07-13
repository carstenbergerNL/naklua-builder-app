export interface UpdateDomainEntityDto {
  id: string;
  name?: string | null;
  tableName?: string | null;
  description?: string | null;
}