export enum CompanyType {
  DEALERSHIP = "DEALERSHIP",
  RENTAL_AGENCY = "RENTAL_AGENCY",
  BUSINESS = "BUSINESS",
}

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  address: string;
  vatNumber: string;
  logoUrl: string;
  createdAt: string;
}

export interface CreateCompanyDto {
  name: string;
  type: CompanyType;
  address: string;
  vatNumber: string;
  logoUrl: string;
}

export interface UpdateCompanyDto {
  name?: string;
  type?: CompanyType;
  address?: string;
  vatNumber?: string;
  logoUrl?: string;
} 