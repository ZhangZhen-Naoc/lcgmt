# 
# client.py
#
# Returns upper limits or fluxes for one or more sky positions
#
# Usage:
#    Single position:      python client.py 123.45 -77.89
#    Position with label : python client.py 123.45 -77.89 "3C273"
#    File of positions:    python client.py file=mysrc.txt
#
#    File of positions should have format:
#
#    ra  dec   <label>
#    ra2  dec2   <label2>
#    ra3  dec3   <label3>
#
#    ra and dec should be in decimal degrees
#    The label is optional and currently can not contain a space !
#
import asyncio
from io import StringIO


import sys
from urllib.request import urlopen
import argparse

import aiohttp


def main():

    # missions = ['Ginga','Asca','Ariel5','XMMpnt','XMMslew','RosatSurvey',
    #             'RosatPointedPSPC','RosatPointedHRI','Integral','ExosatLE',
    #             'ExosatME',
    #             # 'Einstein',  # Einstein 格式出了点问题
    #             'SwiftXRT','Uhuru', 'Vela5B'] # 所有可用的设备
    missions = ['XMMpnt','XMMslew','RosatSurvey','SwiftXRT']
    # Defaults to returning results in text format
    # Defaults to using all the energy bands
    # Defaults to using a spectral model of wabs*pow, with NH=3E20
    # and power-law slope=2.0 to convert c/s to flux

    # Get an array of sources from the input parameters
    FORMAT,sources = getSources()

    # Loop over each source
    for source in sources:

       for mission in missions:

           # Get the flux and upper limits for this mission and position 
           result = ULS_mission(mission, source.ra(), source.dec(), 
                                source.label(), FORMAT)
           print(mission)
           print(result)


def getSources():

    s = []  # A list of sources

    # Get ra,dec from command line arguments
    ra,dec,label,FORMAT,coord_file = getargs()

    
    # If two or three arguments assume it is one source
    if coord_file=="":
       s.append(Source(ra,dec,label))
    else: # Source list
       s = readSourcesFromList(coord_file)

    return FORMAT,s


# Process this position - XMM pointed
async def ULS_mission(mission, ra, dec, label, FORMAT):

    # Make a URL call to the upper limit server
    urlstring=("http://xmmuls.esac.esa.int/ULSservice_passthru?mission="
               + mission + "&ra=" + ra + "&dec=" + dec + "&label=" + label + 
               "&FORMAT=" + FORMAT)
    # res = urlopen(urlstring)
    # await asyncio.sleep(3)
    async with aiohttp.ClientSession() as session:
        async with session.get(urlstring,timeout=60) as resp:
            return await resp.read()



def check_restricted_float(x, low, high):
    x = float(x)
    if x < low or x > high:
        print("%r not in range [0.0, 1.0]"%(x,))
        #raise argparse.ArgumentTypeError("%r not in range [0.0, 1.0]"%(x,))
    return x

def getargs():

    parser = argparse.ArgumentParser(prog='ULS_client')
    parser.add_argument("ra",nargs='?',help="right ascencion",default=0.0)
    parser.add_argument("dec",nargs='?',help="declination")
    parser.add_argument("--label", help="label for source",default="")
    parser.add_argument("--file", help="file of sources",default="")
    parser.add_argument("--FORMAT", help="format",
                        choices=["text","text/html","JSON","csv"],default="text")
    args = parser.parse_args()

    # Get the format
    FORMAT = args.FORMAT
    coord_file = args.file

    # If no file supplied then set coords from an individual source
    if coord_file == "":
       ra = args.ra
       dec = args.dec
       label = args.label
       check_restricted_float(ra,0.0,360.0)
       check_restricted_float(dec,-90.0,90.0)
    else:
       ra="0.0"
       dec="0.0"
       label=""

    # Otherwise assume this is a single position
    if len(sys.argv)<3:
       print("Usage: client.py ra dec <label> or "
                                        "client.py file=<filename>")0       #raise argparse.ArgumentTypeError("Usage: client.py ra dec <label> or "
        #                                "client.py file=<filename>")

    return ra,dec,label,FORMAT,coord_file


# Run the program
if __name__ == "__main__":
        main()
