# Class to describe a source with the property Ra, Dec and Label

class Source(object):

    def __init__(self, ra, dec, label=""):
           self._ra=ra
           self._dec=dec
           # Need to replace any "+" sign as treated as space in REST call
           self._label=label.replace("+","%2B")

    def ra(self):
        return self._ra

    def dec(self):
        return self._dec

    def label(self):
        return self._label

# Method to read a set of sources from a file
#
# Format is RA (degs) DEC (degs) Label (optional)
#
def readSourcesFromList(srcfile):

    sources = []  # Define an empty list of sources
   
    # Open the source list and loop over each source
    with open(srcfile, "r") as ins:
       for line in ins:
           values = line.split()
           if len(values)>2:
              sources.append(Source(values[0],values[1],values[2]))
           else:
              sources.append(Source(values[0],values[1]))


    return sources

# End of repdSourcesFromList

# Test routine
def main():
    print("Testing class")
    src = Source("10.0","-10.0","BigStar")
    print(src.ra(),src.dec(),src.label())
    src = Source("1.0E+2","-10.0E+0","ExpStar")
    print(src.ra(),src.dec(),src.label())
    print("Finished testing class")

if __name__ == "__main__":
        main()

