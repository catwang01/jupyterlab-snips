# JupyterLab 代码片段管理插件

一个用于 JupyterLab 的代码片段管理插件，支持保存、管理和复用常用的代码片段。

## 功能特点

- **代码片段保存**
  - 选中代码并快速保存为代码片段
  - 支持添加名称、分类和描述
  - 支持自定义占位符语法

- **分类管理**
  - 按分类组织代码片段
  - 支持自定义分类
  - 分类筛选功能

- **快速搜索**
  - 支持按名称搜索
  - 支持按描述搜索
  - 支持按分类筛选

- **代码片段操作**
  - 一键插入代码片段
  - 编辑已有片段
  - 删除不需要的片段
  - 代码预览功能

## 安装

```bash
pip install jupyterlab-snips
```

## 使用方法

1. **保存代码片段**
   - 在笔记本中选择要保存的代码
   - 右键点击，选择"保存为代码片段"
   - 填写片段名称、分类（可选）和描述（可选）
   - 点击保存

2. **使用代码片段**
   - 点击左侧边栏的代码片段图标
   - 浏览或搜索需要的代码片段
   - 点击"插入"按钮将代码插入到当前单元格

3. **管理代码片段**
   - 在代码片段面板中查看所有片段
   - 使用搜索框快速查找片段
   - 通过分类筛选器筛选片段
   - 点击"编辑"或"删除"按钮管理片段

## 示例

### 数据处理片段
```python
import pandas as pd

def load_and_clean_data(file_path):
    df = pd.read_csv(file_path)
    df = df.dropna()
    df = df.drop_duplicates()
    return df
```

### 可视化片段
```python
import matplotlib.pyplot as plt

def plot_distribution(data, column):
    plt.figure(figsize=(10, 6))
    data[column].hist()
    plt.title(f'Distribution of {column}')
    plt.show()
```

### 模型训练片段
```python
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

def train_model(X, y, model):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    return accuracy_score(y_test, y_pred)
```

## 开发

### 环境要求

- Python >= 3.7
- Node.js >= 20.0.0
- JupyterLab >= 4.0.0

### 开发安装

```bash
# 克隆仓库
git clone https://github.com/your-name/jupyterlab-snips
cd jupyterlab-snips

# 安装依赖
jlpm install

# 构建插件
jlpm build

# 安装到开发环境
pip install -e .
```

### 开发模式

```bash
# 监视源文件变化并自动重新构建
jlpm watch
```

### 项目结构

```
jupyterlab-snips/
├── package.json           # 项目配置和依赖
├── tsconfig.json         # TypeScript 配置
├── src/                  # 源代码目录
│   ├── index.ts         # 插件入口
│   ├── components/      # React 组件
│   ├── services/        # 业务逻辑
│   ├── models/          # 数据模型
│   └── utils/           # 工具函数
└── style/               # 样式文件
```

## 贡献指南

欢迎提交 Pull Requests 和 Issues！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 BSD-3-Clause 许可证 - 详见 [LICENSE](LICENSE) 文件
```

这个 README 文件包含了：
1. 插件的主要功能介绍
2. 详细的安装说明
3. 使用方法和示例代码
4. 开发环境设置和要求
5. 项目结构说明
6. 贡献指南
7. 许可证信息