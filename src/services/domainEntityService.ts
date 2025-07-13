import { CreateDomainEntityDto } from '../dtos/CreateDomainEntityDto';
import { UpdateDomainEntityDto } from '../dtos/UpdateDomainEntityDto ';
import { DomainEntity } from '../models/DomainEntity';
import { getData, postData, putData, deleteData } from './apiClient';

const BASE_ENDPOINT = '/DomainEntities';

export const getDomainEntitiesByModel = async (
  domainModelId: string, 
  encodedCredential?: string
): Promise<DomainEntity[]> => {
  const url = `${BASE_ENDPOINT}/ByModel/${domainModelId}`;
  return await getData(url, {}, encodedCredential);
};

export const createDomainEntity = async (
  entity: CreateDomainEntityDto, 
  encodedCredential?: string
): Promise<DomainEntity> => {
  return await postData(BASE_ENDPOINT, entity, encodedCredential);
};

export const updateDomainEntity = async (
  updates: UpdateDomainEntityDto,
  encodedCredential?: string
): Promise<DomainEntity> => {
  const url = `${BASE_ENDPOINT}`;
  return await putData(url, updates, encodedCredential);
};

export const deleteDomainEntity = async (
  id: string, 
  encodedCredential?: string
): Promise<void> => {
  const url = `${BASE_ENDPOINT}/${id}`;
  await deleteData(url, encodedCredential);
}; 