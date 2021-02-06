import express, { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import ContactService from "./service";

class ContactController {
    public base = "/contact";
    public router = express.Router();
    public service = new ContactService();

    constructor() {
        this.intializeRoutes();
    }

    public intializeRoutes() {
        this.router.get(
            this.base + "/average-price-most-contacted",
            this.getAvgPriceOfMostContacted
        );
        this.router.get(
            this.base + "/most-contacted-listings",
            this.getMostContactedListings
        );
        this.router.post(
            this.base + "/upload-contacts-file",
            this.uploadContactsFile
        );
    }

    getAvgPriceOfMostContacted = async (
        request: Request,
        response: Response
    ) => {
        response.send(await this.service.getAvgPriceOfMostContacted());
    };

    getMostContactedListings = async (request: Request, response: Response) => {
        response.send(await this.service.getMostContactedListings());
    };

    /**
     * endpoint to upload contacts.csv file
     * the body of the request should contain a key called 'contacts' the file to be uploaded
     */
    uploadContactsFile = async (request: Request, response: Response) => {
        if (
            !request.files ||
            Object.keys(request.files).length === 0 ||
            !request.files.contacts
        ) {
            return response.status(400).send("No file was uploaded.");
        }

        if ((request.files.contacts as UploadedFile).mimetype !== "text/csv") {
            return response.status(400).send("Your file should be csv file");
        }
        const res = await this.service.uploadContactsFile(
            request.files.contacts as UploadedFile
        );

        if (typeof res === "string") {
            response.status(200);
        } else {
            response.status(400);
        }

        response.send(res);
    };
}

export default ContactController;
