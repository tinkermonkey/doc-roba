import cv2, numpy as np, sys, json, argparse, os

# Parse the command line args
parser = argparse.ArgumentParser(description='Template align two images')
parser.add_argument('--method', default='cv2.TM_CCORR_NORMED', choices=[
            'cv2.TM_CCOEFF', 'cv2.TM_CCOEFF_NORMED', 'cv2.TM_CCORR',
            'cv2.TM_CCORR_NORMED', 'cv2.TM_SQDIFF', 'cv2.TM_SQDIFF_NORMED'],
            help='matchTemplate method to use for the comparison')
parser.add_argument('files', metavar='files', nargs=2,
            help='two files to compare')

args  = parser.parse_args()
file1 = args.files[0]
file2 = args.files[1]

# Make sure the files exist
if not os.path.exists(file1):
    raise Exception('file not found', 'could not find file [%s]' % file1 )
if not os.path.exists(file2):
    raise Exception('file not found', 'could not find file [%s]' % file2 )

# Load the images
image1          = cv2.imread(file1, 0)
image2		    = cv2.imread(file2, 0)
width1, height1 = image1.shape[::-1]
width2, height2	= image2.shape[::-1]

# Interpret the analysis method
method = eval(args.method)

# Apply template Matching
if width1 < width2:
	result = cv2.matchTemplate(image1, image2, method)
else:
	result = cv2.matchTemplate(image2, image1, method)

# Get the results
min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)

# Get the sign right for the results
if width1 < width2:
	dX	= 0 - max_loc[0]
	dY	= 0 - max_loc[1]
else:
	dX	= max_loc[0]
	dY	= max_loc[1]

# Simply spit out a JSON response
print json.dumps({'transform': {'x': dX, 'y': dY}})
