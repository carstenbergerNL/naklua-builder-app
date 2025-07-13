export interface DomainAttribute {
  id: string;
  entityId: string;
  name: string;
  dataType: string;
  length: number;
  isRequired: boolean;
  isPrimaryKey: boolean;
  defaultValue: string;
  creatorId: string;
  createdAt: string;
}