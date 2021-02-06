import csv from "csv-parser";
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import path from "path";
import CSVFileValidator from "csv-file-validator";
import { ListingRow } from "./interface";

class ListingService {
    public listingsFilePath = path.join(__dirname, "..", "/db/listings.csv");

    getSellingPrice = () => {
        const resultsMap = new Map<string, { total: number; sum: number }>();

        return new Promise((resolve, reject) => {
            fs.createReadStream(this.listingsFilePath)
                .pipe(csv())
                .on("data", (data: ListingRow) => {
                    if (resultsMap.has(data.seller_type)) {
                        let { total, sum } = resultsMap.get(data.seller_type);
                        total += Number(data.price);
                        sum++;
                        resultsMap.set(data.seller_type, { total, sum });
                    } else {
                        resultsMap.set(data.seller_type, {
                            total: Number(data.price),
                            sum: 1,
                        });
                    }
                })
                .on("end", () => {
                    const result = new Array<{
                        seller_type: string;
                        average: number;
                    }>();
                    for (const [key, value] of resultsMap) {
                        const average = value.total / value.sum;
                        result.push({ seller_type: key, average });
                    }
                    resolve(JSON.stringify(result));
                })
                .on("error", (error) => reject(error));
        });
    };

    getCarsDistribution = () => {
        const resultsMap = new Map<string, number>();

        return new Promise((resolve, reject) => {
            // count the total number of items in the listings sheet
            let totalItems = 0;

            fs.createReadStream(this.listingsFilePath)
                .pipe(csv())
                .on("data", (data: ListingRow) => {
                    const numberOfCars = resultsMap.has(data.make)
                        ? resultsMap.get(data.make) + 1
                        : 1;
                    resultsMap.set(data.make, numberOfCars);
                    totalItems++;
                })
                .on("end", () => {
                    const result = new Array<{
                        make: string;
                        total: number;
                    }>();
                    for (const [key, value] of resultsMap) {
                        result.push({
                            make: key,
                            total: Math.round((value / totalItems) * 100),
                        });
                    }

                    result.sort((a, b) => {
                        if (a.total < b.total) {
                            return 1;
                        } else if (a.total > b.total) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });

                    resolve(JSON.stringify(result));
                })
                .on("error", (error) => reject(error));
        });
    };

    uploadListingsFile = async (file: UploadedFile) => {
        file.mv(file.name);
        const stream = fs.createReadStream(file.name);

        const config = {
            headers: [
                {
                    name: "id",
                    inputName: "id",
                    required: true,
                    validate: (id) => typeof id === "string",
                },
                {
                    name: "make",
                    inputName: "make",
                    required: true,
                    validate: (make) => typeof make === "string",
                },
                {
                    name: "price",
                    inputName: "price",
                    required: true,
                    validate: (price) => !isNaN(price),
                },
                {
                    name: "mileage",
                    inputName: "mileage",
                    required: true,
                    validate: (mileage) => !isNaN(mileage),
                },
                {
                    name: "seller_type",
                    inputName: "seller_type",
                    required: true,
                    validate: (sellerType) => typeof sellerType === "string",
                },
            ],
            isHeaderNameOptional: false,
        };

        const csvData = await CSVFileValidator(stream, config).catch((err) =>
            console.log(err)
        );

        if (csvData.inValidMessages.length > 0) {
            // delete the file
            fs.unlinkSync(file.name);
            return csvData.inValidMessages;
        } else {
            file.mv(this.listingsFilePath);
            fs.unlinkSync(file.name);
            return "File saved successfully";
        }
    };
}

export default ListingService;
