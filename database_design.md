# 数据库表设计

## 1. 部门表 (departments)

| 字段名 | 字段类型 | 描述 | 约束 |
|--------|----------|------|------|
| id | INT | 部门ID | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(50) | 部门名称 | NOT NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

## 2. 岗位表 (positions)

| 字段名 | 字段类型 | 描述 | 约束 |
|--------|----------|------|------|
| id | INT | 岗位ID | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(50) | 岗位名称 | NOT NULL |
| role | ENUM('employee', 'material_admin', 'repairman', 'super_admin') | 角色权限 | NOT NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

## 3. 用户表 (users)

| 字段名 | 字段类型 | 描述 | 约束 |
|--------|----------|------|------|
| id | INT | 用户ID | PRIMARY KEY, AUTO_INCREMENT |
| department_id | INT | 所属部门ID | FOREIGN KEY REFERENCES departments(id) |
| position_id | INT | 所属岗位ID | FOREIGN KEY REFERENCES positions(id) |
| name | VARCHAR(50) | 姓名 | NOT NULL |
| phone | VARCHAR(20) | 手机号 | NOT NULL, UNIQUE |
| password | VARCHAR(255) | 密码 | NOT NULL |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

## 4. 设备表 (equipment)

| 字段名 | 字段类型 | 描述 | 约束 |
|--------|----------|------|------|
| id | INT | 设备ID | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(100) | 设施设备名称 | NOT NULL |
| model | VARCHAR(50) | 设备型号 | NOT NULL |
| location | VARCHAR(100) | 设备位置 | NOT NULL |
| status | ENUM('normal', 'faulty', 'maintenance') | 设备状态 | DEFAULT 'normal' |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

## 5. 报修表 (repair_requests)

| 字段名 | 字段类型 | 描述 | 约束 |
|--------|----------|------|------|
| id | INT | 报修ID | PRIMARY KEY, AUTO_INCREMENT |
| user_id | INT | 报修人ID | FOREIGN KEY REFERENCES users(id) |
| equipment_id | INT | 设备ID | FOREIGN KEY REFERENCES equipment(id) |
| fault_description | TEXT | 故障描述 | NOT NULL |
| fault_images | JSON | 故障照片路径 | |
| status | ENUM('pending', 'processing', 'completed', 'transferred') | 报修状态 | DEFAULT 'pending' |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

## 6. 维修记录表 (repair_records)

| 字段名 | 字段类型 | 描述 | 约束 |
|--------|----------|------|------|
| id | INT | 维修记录ID | PRIMARY KEY, AUTO_INCREMENT |
| repair_request_id | INT | 报修ID | FOREIGN KEY REFERENCES repair_requests(id) |
| repairman_id | INT | 维修人员ID | FOREIGN KEY REFERENCES users(id) |
| solution_description | TEXT | 解决方案 | |
| solution_images | JSON | 解决照片路径 | |
| status | ENUM('completed', 'transferred') | 维修状态 | NOT NULL |
| transfer_note | TEXT | 移交说明 | |
| completed_at | TIMESTAMP | 完成时间 | |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

## 7. 物资表 (materials)

| 字段名 | 字段类型 | 描述 | 约束 |
|--------|----------|------|------|
| id | INT | 物资ID | PRIMARY KEY, AUTO_INCREMENT |
| name | VARCHAR(100) | 物资名称 | NOT NULL |
| type | VARCHAR(50) | 物资类型 | NOT NULL |
| unit | VARCHAR(20) | 计量单位 | NOT NULL |
| stock_quantity | INT | 库存数量 | NOT NULL DEFAULT 0 |
| min_stock | INT | 最小库存 | DEFAULT 0 |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

## 8. 物资申领表 (material_requests)

| 字段名 | 字段类型 | 描述 | 约束 |
|--------|----------|------|------|
| id | INT | 申领ID | PRIMARY KEY, AUTO_INCREMENT |
| user_id | INT | 申领人ID | FOREIGN KEY REFERENCES users(id) |
| material_id | INT | 物资ID | FOREIGN KEY REFERENCES materials(id) |
| request_quantity | INT | 申领数量 | NOT NULL |
| status | ENUM('pending', 'approved', 'rejected') | 申领状态 | DEFAULT 'pending' |
| approved_by | INT | 审批人ID | FOREIGN KEY REFERENCES users(id) |
| approved_at | TIMESTAMP | 审批时间 | |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | 更新时间 | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

## 9. 物资出入库表 (material_inventory_logs)

| 字段名 | 字段类型 | 描述 | 约束 |
|--------|----------|------|------|
| id | INT | 出入库ID | PRIMARY KEY, AUTO_INCREMENT |
| material_id | INT | 物资ID | FOREIGN KEY REFERENCES materials(id) |
| type | ENUM('in', 'out') | 操作类型（入库/出库） | NOT NULL |
| quantity | INT | 操作数量 | NOT NULL |
| operator_id | INT | 操作人ID | FOREIGN KEY REFERENCES users(id) |
| description | TEXT | 操作描述 | |
| created_at | TIMESTAMP | 创建时间 | DEFAULT CURRENT_TIMESTAMP |

## 表关系说明

1. 部门表与用户表：一对多关系（一个部门对应多个用户）
2. 岗位表与用户表：一对多关系（一个岗位对应多个用户）
3. 用户表与报修表：一对多关系（一个用户可以提交多个报修）
4. 设备表与报修表：一对多关系（一个设备可以有多个报修记录）
5. 报修表与维修记录表：一对一关系（一个报修对应一个维修记录）
6. 用户表与维修记录表：一对多关系（一个维修人员可以处理多个维修记录）
7. 用户表与物资申领表：一对多关系（一个用户可以申领多个物资）
8. 物资表与物资申领表：一对多关系（一个物资可以被多个用户申领）
9. 物资表与物资出入库表：一对多关系（一个物资可以有多个出入库记录）
10. 用户表与物资出入库表：一对多关系（一个用户可以进行多个出入库操作）