import express, { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import ListingService from "./service";

class ListingController {
    public base = "/listing";
    public router = express.Router();
    public service = new ListingService();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.get(this.base + "/selling-price", this.getSellingPrice);
        this.router.get(
            this.base + "/cars-distribution",
            this.getCarsDistribution
        );
        this.router.post(
            this.base + "/upload-listings-file",
            this.uploadListingsFile
        );
    }

    getSellingPrice = async (request: Request, response: Response) => {
        response.send(await this.service.getSellingPrice());
    };

    getCarsDistribution = async (request: Request, response: Response) => {
        response.send(await this.service.getCarsDistribution());
    };

    /**
     * endpoint to upload listings.csv file
     * the body of the request should contain a key called 'listings' the file to be uploaded
     */
    uploadListingsFile = async (request: Request, response: Response) => {
        if (
            !request.files ||
            Object.keys(request.files).length === 0 ||
            !request.files.listings
        ) {
            return response.status(400).send("No file was uploaded.");
        }

        if ((request.files.listings as UploadedFile).mimetype !== "text/csv") {
            return response.status(400).send("Your file should be csv file");
        }
        const res = await this.service.uploadListingsFile(
            request.files.listings as UploadedFile
        );

        if (typeof res === "string") {
            response.status(200);
        } else {
            response.status(400);
        }

        response.send(res);
    };
}

export default ListingController;
