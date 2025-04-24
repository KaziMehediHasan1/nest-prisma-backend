import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { CreateTaskDto } from './dto/createTask.dto';
import { ApiResponse } from 'src/interfaces/response';
import { IdDto } from 'src/common/dto/id.dto';
import { UpdateTaskDto } from './dto/updateTask.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

@Injectable()
export class CheckListService {
  constructor(private readonly db: DbService) {}

  public async crateCheckList(
    rawData: CreateTaskDto,
  ): Promise<ApiResponse<any>> {
    const { profileId, ...rest } = rawData;

    const task = await this.db.task.create({
      data: {
        ...(profileId && {
          Profile: {
            connect: {
              id: profileId,
            },
          },
        }),
        ...rest,
      },
    });

    return {
      success: true,
      data: task,
      message: 'Task created successfully',
      statusCode: 200,
    };
  }

  public async update(
    id: IdDto,
    rawData: UpdateTaskDto,
  ): Promise<ApiResponse<any>> {
    const updated = await this.db.task.update({
      where: {
        id: id.id,
      },
      data: rawData,
    });

    return {
      success: true,
      data: updated,
      message: 'Task updated successfully',
      statusCode: 200,
    };
  }

  public async delete(id: IdDto): Promise<ApiResponse<any>> {
    const deleted = await this.db.task.delete({
      where: {
        id: id.id,
      },
    });

    return {
      success: true,
      data: deleted,
      message: 'Task deleted successfully',
      statusCode: 200,
    };
  }

  public async getAll({
    skip,
    take,
  }: PaginationDto): Promise<ApiResponse<any>> {
    const tasks = await this.db.task.findMany({
      skip,
      take,
    });

    return {
      success: true,
      data: tasks,
      message: 'Tasks fetched successfully',
      statusCode: 200,
    };
  }

  public async getTaskById(id: IdDto): Promise<ApiResponse<any>> {
    const task = await this.db.task.findUnique({
      where: {
        id: id.id,
      },
    });

    return {
      success: true,
      data: task,
      message: 'Task fetched successfully',
      statusCode: 200,
    };
  }

  public async filter({ done }: FilterTaskDto): Promise<ApiResponse<any>> {
    const tasks = await this.db.task.findMany({
      where: {
        done,
      },
    });

    const now = new Date();

    const taskWithArgent = tasks.map(task => {
        const timeDiff = new Date(task.time).getTime() - now.getTime();
        const hoursLeft = timeDiff / (1000 * 60 * 60);
        const urgent = hoursLeft <= 12;
  
        return {
          ...task,
          urgent,
        };
      });

    return {
      success: true,
      data: taskWithArgent,
      message: 'Tasks fetched successfully',
      statusCode: 200,
    };
  }
}
