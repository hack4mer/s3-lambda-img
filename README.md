
# S3 Lambda Image Optimizer

A Lambda funtion to resize, optimize and save S3 images in realtime

### What it does
* Takes image's S3 path form URI
* Checks if a optimized version of the image is present in S3 or not
	* Yes: 
		* Redirects you to the optimized image 
	* No:
		* Optimizes the image as per the defined parameters
  		* Uploads it on S3
  		* Redirects you to the optimized image




### Development

* Install Node Version `^6.10`
* Run `npm install`
* Install nodemon: `npm install nodemon -g`
* Start the local server `nodemon express`
* You can test lambda for a particular s3 path using `http://localhost:3000/?path=<Relative Path with size>`
* To Change bucket & Redirect URL. Update `express.js` file `process.env.BUCKET`

### Production

Zip the following files and upload it on lambda
```
index.js
node_modules
package.json
```
