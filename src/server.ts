import express, {Router, Request, Response} from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

const urlExists = require("url-exists");

(async () => {

    // Init the Express application
    const app = express();

    // Set the network port
    const port = process.env.PORT || 8082;

    // Use the body parser middleware for post requests
    app.use(bodyParser.json());

    // QUERY PARAMETERS
    //    image_url: URL of a publicly accessible image
    // RETURNS
    //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
    // http://localhost:8082/filteredimage/?img_url=https://d2eip9sf3oo6c2.cloudfront.net/tags/images/000/000/256/full/nodejslogo.png
    app.get("/filteredimage/", async (req, res) => {

        // source - https://stackoverflow.com/a/48842680/5848359
        const url = req.query['img_url'];
        // 1. validate the image_url query
        urlExists(url, function (err: any, exists: any) {
            if (exists) {
                // res.send('Good URL');
                console.log('Valid working url');
            } else {
                console.log('Invalid or not working url');
                res.status(400).send('Bad URL was sent to the endpoint');
            }
        });

        // 2. call filterImageFromURL(image_url) to filter the image
        try {
            var ret = await filterImageFromURL(url);
        } catch (error) {
            console.log(error);
        }

        // 3. send the resulting file in the response
        await res.status(200).sendFile(ret, function () {
            // 4. deletes any files on the server on finish of the response
            deleteLocalFiles([ret]).then(function () {
                console.log("File deleted!");
            }).catch(function (error) {
                console.error(error);
            });

        });

    });

    // Root Endpoint
    // Displays a simple message to the user
    app.get("/", async (req, res) => {
        res.send("try GET /filteredimage?image_url={{}}");
    });

    app.get("/test/", async (req, res) => {
        var q = req.query;
        console.log(typeof q);
        console.log(q);
    });
    // Start the Server
    app.listen(port, () => {
        console.log(`server running http://localhost:${port}`);
        console.log(`press CTRL+C to stop server`);
    });
})();