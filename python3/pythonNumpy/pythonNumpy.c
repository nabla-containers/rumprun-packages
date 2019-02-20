//github.com/patmarion/NumpyBuiltinExample
#include <Python.h>
#include <stdio.h>
#include "numpy_builtin.h"
#include "frozen.h"

int main(int argc, char **argv)
{

  FILE* inFile = 0;
  if (argc > 1) {
      inFile = fopen(argv[1], "r");
      if (!inFile) {
        printf("Failed to open file: %s\n", argv[1]);
        return 1;
      }
  }

  add_numpy_builtin();
  PyImport_FrozenModules = _PyImport_FrozenModules;
  Py_FrozenFlag = 1;
  Py_NoSiteFlag = 1;

  Py_SetProgramName(argv[0]);
  Py_Initialize();

  int retCode;

  if (inFile) {
    retCode = PyRun_SimpleFile(inFile, argv[1]);
    fclose(inFile);
  } 
  else {
    retCode = Py_Main(argc, argv);
  }

  Py_Finalize();

  return retCode;
}
