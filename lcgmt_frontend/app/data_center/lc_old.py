#!/usr/bin/python
# create date: 2012-05-16
# author: mnj
# there are 2 HDU in the 1D file.
import os
import sys
import pyfits
import numpy
import scipy.signal


#filename=sys.argv[1]
filename='spec-55859-F5902_sp01-001.fits'
#filename='spec-55859-M5901_sp01-023.fits'
#filename='spec-55859-F5909_sp10-238.fits'
hdulist = pyfits.open(filename)
head = hdulist[0].header
scidata = hdulist[0].data

coeff0 = head['COEFF0']
coeff1 = head['COEFF1']
pixel_num = head['NAXIS1'] 
specflux = scidata[0,]
spec_noconti = scidata[2,]
wavelength=numpy.linspace(0,pixel_num,pixel_num)

wavelength=numpy.power(10,(coeff0+wavelength*coeff1))
hdulist.close()

specflux2=scipy.signal.medfilt(specflux,7)
specflux3=scipy.signal.medfilt(specflux,15)
f = open ( 'test.txt', 'w' )

f.write('Wavelength,Flux,FluxSmooth,,FluxSmooth\n')

for i in range(len(wavelength)):
	#print '%f,%f,%f\\n' % (wavelength[i],tmp,spec_noconti[i]),
	f.write('%f,%f,%f,%f\n' % (wavelength[i],specflux[i],specflux2[i],specflux3[i]))
	
f.close()

