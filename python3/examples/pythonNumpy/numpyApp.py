import numpy

def matmul():
    a = numpy.matrix([[1, 0], [0, 1]])
    b = numpy.matrix([[4, 1], [2, 2]])
    c = a * b
    print("Matrix A:\n",a)
    print("Matrix B:\n",b)
    print("Matrix C=A.B:\n",c)
    print("Matrix Transpose(C):\n",c.T)

def fft():
    sine = numpy.sin(numpy.arange(256))
    fft = numpy.fft.fft(sine)
    print("Sine wave:\n",sine)
    print("FFT:\n",fft)


matmul()
fft()
