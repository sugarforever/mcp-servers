Title: Working on projects | uv

URL Source: https://docs.astral.sh/uv/guides/projects/

Markdown Content:
uv supports managing Python projects, which define their dependencies in a `pyproject.toml` file.

[Creating a new project](https://docs.astral.sh/uv/guides/projects/#creating-a-new-project)
-------------------------------------------------------------------------------------------

You can create a new Python project using the `uv init` command:

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-0-1)$ uvinithello-world
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-0-2)$ cdhello-world
```

Alternatively, you can initialize a project in the working directory:

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-1-1)$ mkdirhello-world
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-1-2)$ cdhello-world
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-1-3)$ uvinit
```

uv will create the following files:

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-2-1).
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-2-2)├── .python-version
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-2-3)├── README.md
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-2-4)├── main.py
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-2-5)└── pyproject.toml
```

The `main.py` file contains a simple "Hello world" program. Try it out with `uv run`:

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-3-1)$ uvrunmain.py
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-3-2)Hello from hello-world!
```

[Project structure](https://docs.astral.sh/uv/guides/projects/#project-structure)
---------------------------------------------------------------------------------

A project consists of a few important parts that work together and allow uv to manage your project. In addition to the files created by `uv init`, uv will create a virtual environment and `uv.lock` file in the root of your project the first time you run a project command, i.e., `uv run`, `uv sync`, or `uv lock`.

A complete listing would look like:

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-4-1).
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-4-2)├── .venv
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-4-3)│   ├── bin
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-4-4)│   ├── lib
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-4-5)│   └── pyvenv.cfg
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-4-6)├── .python-version
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-4-7)├── README.md
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-4-8)├── main.py
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-4-9)├── pyproject.toml
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-4-10)└── uv.lock
```

### [`pyproject.toml`](https://docs.astral.sh/uv/guides/projects/#pyprojecttoml)

The `pyproject.toml` contains metadata about your project:

pyproject.toml

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-5-1)[project]
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-5-2)name="hello-world"
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-5-3)version="0.1.0"
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-5-4)description="Add your description here"
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-5-5)readme="README.md"
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-5-6)dependencies=[]
```

You'll use this file to specify dependencies, as well as details about the project such as its description or license. You can edit this file manually, or use commands like `uv add` and `uv remove` to manage your project from the terminal.

Tip

See the official [`pyproject.toml` guide](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/) for more details on getting started with the `pyproject.toml` format.

You'll also use this file to specify uv [configuration options](https://docs.astral.sh/uv/configuration/files/) in a [`[tool.uv]`](https://docs.astral.sh/uv/reference/settings/) section.

### [`.python-version`](https://docs.astral.sh/uv/guides/projects/#python-version)

The `.python-version` file contains the project's default Python version. This file tells uv which Python version to use when creating the project's virtual environment.

### [`.venv`](https://docs.astral.sh/uv/guides/projects/#venv)

The `.venv` folder contains your project's virtual environment, a Python environment that is isolated from the rest of your system. This is where uv will install your project's dependencies.

See the [project environment](https://docs.astral.sh/uv/concepts/projects/layout/#the-project-environment) documentation for more details.

### [`uv.lock`](https://docs.astral.sh/uv/guides/projects/#uvlock)

`uv.lock` is a cross-platform lockfile that contains exact information about your project's dependencies. Unlike the `pyproject.toml` which is used to specify the broad requirements of your project, the lockfile contains the exact resolved versions that are installed in the project environment. This file should be checked into version control, allowing for consistent and reproducible installations across machines.

`uv.lock` is a human-readable TOML file but is managed by uv and should not be edited manually.

See the [lockfile](https://docs.astral.sh/uv/concepts/projects/layout/#the-lockfile) documentation for more details.

[Managing dependencies](https://docs.astral.sh/uv/guides/projects/#managing-dependencies)
-----------------------------------------------------------------------------------------

You can add dependencies to your `pyproject.toml` with the `uv add` command. This will also update the lockfile and project environment:

You can also specify version constraints or alternative sources:

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-7-1)$ # Specify a version constraint
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-7-2)$ uvadd'requests==2.31.0'
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-7-3)
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-7-4)$ # Add a git dependency
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-7-5)$ uvaddgit+https://github.com/psf/requests
```

If you're migrating from a `requirements.txt` file, you can use `uv add` with the `-r` flag to add all dependencies from the file:

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-8-1)$ # Add all dependencies from `requirements.txt`.
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-8-2)$ uvadd-rrequirements.txt-cconstraints.txt
```

To remove a package, you can use `uv remove`:

To upgrade a package, run `uv lock` with the `--upgrade-package` flag:

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-10-1)$ uvlock--upgrade-packagerequests
```

The `--upgrade-package` flag will attempt to update the specified package to the latest compatible version, while keeping the rest of the lockfile intact.

See the documentation on [managing dependencies](https://docs.astral.sh/uv/concepts/projects/dependencies/) for more details.

[Running commands](https://docs.astral.sh/uv/guides/projects/#running-commands)
-------------------------------------------------------------------------------

`uv run` can be used to run arbitrary scripts or commands in your project environment.

Prior to every `uv run` invocation, uv will verify that the lockfile is up-to-date with the `pyproject.toml`, and that the environment is up-to-date with the lockfile, keeping your project in-sync without the need for manual intervention. `uv run` guarantees that your command is run in a consistent, locked environment.

For example, to use `flask`:

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-11-1)$ uvaddflask
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-11-2)$ uvrun--flaskrun-p3000
```

Or, to run a script:

example.py

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-12-1)# Require a project dependency
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-12-2)import flask
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-12-3)
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-12-4)print("hello world")
```

Alternatively, you can use `uv sync` to manually update the environment then activate it before executing a command:

macOS and LinuxWindows

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-14-1)$ uvsync
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-14-2)$ source.venv/bin/activate
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-14-3)$ flaskrun-p3000
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-14-4)$ pythonexample.py
```

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-15-1)uv sync
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-15-2)source .venv\Scripts\activate
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-15-3)flask run -p 3000
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-15-4)python example.py
```

Note

The virtual environment must be active to run scripts and commands in the project without `uv run`. Virtual environment activation differs per shell and platform.

See the documentation on [running commands and scripts](https://docs.astral.sh/uv/concepts/projects/run/) in projects for more details.

[Building distributions](https://docs.astral.sh/uv/guides/projects/#building-distributions)
-------------------------------------------------------------------------------------------

`uv build` can be used to build source distributions and binary distributions (wheel) for your project.

By default, `uv build` will build the project in the current directory, and place the built artifacts in a `dist/` subdirectory:

```
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-16-1)$ uvbuild
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-16-2)$ lsdist/
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-16-3)hello-world-0.1.0-py3-none-any.whl
[](https://docs.astral.sh/uv/guides/projects/#__codelineno-16-4)hello-world-0.1.0.tar.gz
```

See the documentation on [building projects](https://docs.astral.sh/uv/concepts/projects/build/) for more details.

[Next steps](https://docs.astral.sh/uv/guides/projects/#next-steps)
-------------------------------------------------------------------

To learn more about working on projects with uv, see the [projects concept](https://docs.astral.sh/uv/concepts/projects/) page and the [command reference](https://docs.astral.sh/uv/reference/cli/#uv).

Or, read on to learn how to [build and publish your project to a package index](https://docs.astral.sh/uv/guides/package/).