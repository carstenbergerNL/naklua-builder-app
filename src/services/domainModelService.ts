import { getData, postData, putData, deleteData } from './apiClient';
import { DomainModel } from '../models/DomainModel';
import { CreateDomainModelDto } from '../dtos/CreateDomainModelDto';
import { UpdateDomainModelDto } from '../dtos/UpdateDomainModelDto';

export type { DomainModel };

const BASE_ENDPOINT = '/DomainModels';

export const getDomainModelsByApp = async (
  appInstanceId: string, 
  encodedCredential?: string
): Promise<DomainModel[]> => {
  const url = `${BASE_ENDPOINT}/ByApp/${appInstanceId}`;
  return await getData(url, {}, encodedCredential);
};

export const createDomainModel = async (
  model: CreateDomainModelDto, 
  encodedCredential?: string
): Promise<DomainModel> => {
  return await postData(BASE_ENDPOINT, model, encodedCredential);
};

export const updateDomainModel = async (
  updates: UpdateDomainModelDto,
  encodedCredential?: string
): Promise<DomainModel> => {
  const url = `${BASE_ENDPOINT}`;
  return await putData(url, updates, encodedCredential);
};

export const deleteDomainModel = async (
  id: string, 
  encodedCredential?: string
): Promise<void> => {
  const url = `${BASE_ENDPOINT}/${id}`;
  await deleteData(url, encodedCredential);
}; 