"""
jupyterlab-snips setup
"""
import json
from pathlib import Path

import setuptools

HERE = Path(__file__).parent.resolve()
name = "jupyterlab_snips"

# Get version
with (HERE / "package.json").open() as f:
    version = json.load(f)["version"]

setup_args = dict(
    name=name,
    version=version,
    url="https://github.com/catwang01/jupyterlab_snips",
    author="catwang01",
    author_email="edwardelricwzx@gmail.com",
    description="A JupyterLab extension for managing code snippets",
    long_description=Path("README.md").read_text() if Path("README.md").exists() else "",
    long_description_content_type="text/markdown",
    packages=setuptools.find_packages(),
    install_requires=[
        "jupyterlab>=4.0.0,<5.0.0",
        "jupyter_server>=2.0.0",
    ],
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.7",
    platforms="Linux, Mac OS X, Windows",
    keywords=["Jupyter", "JupyterLab", "JupyterLab4"],
    classifiers=[
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
        "Framework :: Jupyter :: JupyterLab :: 4",
        "Framework :: Jupyter :: JupyterLab :: Extensions",
        "Framework :: Jupyter :: JupyterLab :: Extensions :: Prebuilt",
        "License :: OSI Approved :: BSD License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
    ],
)

if __name__ == "__main__":
    setuptools.setup(**setup_args) 