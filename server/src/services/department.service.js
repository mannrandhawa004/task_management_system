import DepartmentModel from "../models/department.model.js";
import { ConflictError, NotFoundError } from "../utils/errorHandler.js";

class DepartmentService {
  async createDepartment({ name, description, status }) {
    const existing = await DepartmentModel.getByName(name);
    if (existing) {
      throw new ConflictError(`Department with name "${name}" already exists`);
    }

    const result = await DepartmentModel.create({ name, description, status });
    return await DepartmentModel.getById(result.insertId);
  }

  async getDepartmentDetails(id) {
    const department = await DepartmentModel.getById(id);
    if (!department) {
      throw new NotFoundError("Department not found");
    }
    return department;
  }

  async updateDepartment(id, { name, description, status }) {
    const department = await DepartmentModel.getById(id);
    if (!department) {
      throw new NotFoundError("Department not found");
    }

    if (name && name !== department.name) {
      const existing = await DepartmentModel.getByName(name);
      if (existing) {
        throw new ConflictError(`Department with name "${name}" already exists`);
      }
    }

    await DepartmentModel.update(id, {
      name: name || department.name,
      description: description !== undefined ? description : department.description,
      status: status || department.status,
    });

    return await DepartmentModel.getById(id);
  }

  async deleteDepartment(id) {
    const department = await DepartmentModel.getById(id);
    if (!department) {
      throw new NotFoundError("Department not found");
    }

    return await DepartmentModel.delete(id);
  }

  async getDepartmentList({ limit, offset }) {
    const rows = await DepartmentModel.getAll(limit, offset);
    const total = await DepartmentModel.count();
    return { rows, total };
  }

  async getDepartmentUsers(id) {
    const department = await DepartmentModel.getById(id);
    if (!department) {
      throw new NotFoundError("Department not found");
    }
    return await DepartmentModel.getUsers(id);
  }

  async getDepartmentStats(id) {
    const department = await DepartmentModel.getById(id);
    if (!department) {
      throw new NotFoundError("Department not found");
    }
    return await DepartmentModel.getStats(id);
  }
}

export default new DepartmentService();
