import { getData, postData, putData, deleteData } from './apiClient';
import { DomainAttribute } from '../models/DomainAttribute';
import { CreateDomainAttributeDto } from '../dtos/CreateDomainAttributeDto';
import { UpdateDomainAttributeDto } from '../dtos/UpdateDomainAttributeDto';

const BASE_ENDPOINT = '/DomainAttributes';

export const getDomainAttributesByEntity = async (
  entityId: string, 
  encodedCredential?: string
): Promise<DomainAttribute[]> => {
  const url = `${BASE_ENDPOINT}/ByEntity/${entityId}`;
  return await getData(url, {}, encodedCredential);
};

export const createDomainAttribute = async (
  attribute: CreateDomainAttributeDto, 
  encodedCredential?: string
): Promise<DomainAttribute> => {
  return await postData(BASE_ENDPOINT, attribute, encodedCredential);
};

export const updateDomainAttribute = async (
  attribute: UpdateDomainAttributeDto, 
  encodedCredential?: string
): Promise<DomainAttribute> => {
  const url = `${BASE_ENDPOINT}`;
  return await putData(url, attribute, encodedCredential);
};

export const deleteDomainAttribute = async (
  id: string, 
  encodedCredential?: string
): Promise<void> => {
  const url = `${BASE_ENDPOINT}/${id}`;
  await deleteData(url, encodedCredential);
}; 