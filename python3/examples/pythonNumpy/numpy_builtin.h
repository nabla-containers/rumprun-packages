
#include <Python.h>

#ifdef __cplusplus
extern "C" {
#endif

extern void PyInit_multiarray();
extern void PyInit_multiarray_tests();
extern void PyInit_scalarmath();
extern void PyInit_umath();
extern void PyInit_umath_tests();
//extern void PyInit__sort();
//extern void PyInit__dotblas();
extern void PyInit_fftpack_lite();
extern void PyInit__compiled_base();
extern void PyInit_lapack_lite();
extern void PyInit__capi();
extern void PyInit_mtrand();

void add_numpy_builtin()
{
  PyImport_AppendInittab("numpy.core.multiarray", PyInit_multiarray);
  PyImport_AppendInittab("numpy.core.multiarray_tests", PyInit_multiarray_tests);
  PyImport_AppendInittab("numpy.core.scalarmath", PyInit_scalarmath);
  PyImport_AppendInittab("numpy.core.umath", PyInit_umath);
  PyImport_AppendInittab("numpy.core.umath_tests", PyInit_umath_tests);
  //PyImport_AppendInittab("numpy.core._dotblas", PyInit__dotblas);
  //PyImport_AppendInittab("numpy.core._sort", PyInit__sort);
  PyImport_AppendInittab("numpy.fft.fftpack_lite", PyInit_fftpack_lite);
  PyImport_AppendInittab("numpy.lib._compiled_base", PyInit__compiled_base);
  PyImport_AppendInittab("numpy.linalg.lapack_lite", PyInit_lapack_lite);
  PyImport_AppendInittab("numpy.numarray._capi", PyInit__capi);
  PyImport_AppendInittab("numpy.random.mtrand", PyInit_mtrand);
}

#ifdef __cplusplus
}
#endif
