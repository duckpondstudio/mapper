# Data Files
Summary of what each of these classes do 

### DataContainer
Containers for DataLocations, eg RegionsContainer contains all the Regions generated 

### DataCreator
Reads the data from given input CSVs and stuff, and converts them into internal data. 
Also creates output CSVs with data parsed for internal use 
- Needs to be split into two, DataCreator and DataWriter  

### DataDisplay
takes parsed input data and displays it onto web-rendered map, prepping it for DataOverlay to render 

### DataGetter 
all Location-centric GetXWithY getters, eg GetCityWithGeoPoint, GetAllRegionsInContinent, etc

### DataInterpreter
sets up the editing of specific CSV files for DataCreator, eg "MyData.csv has CountryName in column 3", etc 

### DataLocation
Location class itself, plus contextual subclasses (continent, region, country, city) 

### DataNames
names of all text for common column descriptors, used to auto-detect data columns for reading CSVs 

### DataOverlay
used to actually RENDER onto the map, as a visual overlay (DataDisplay converts the data from input info to something dataOverlay can read, DataOverlay actually renders it.

### maps.js
should be moved lol 

## Archived / Obsolete Classes

### DataDot
obsolete? represents one dot (or whatever shape) rendered to the map by DataDisplay 

### DataLocale
info used by DataDot to contain positional information. Should prolly be replaced with a reference to Location
