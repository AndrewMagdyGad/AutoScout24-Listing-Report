import csv from "csv-parser";
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import path from "path";
import CSVFileValidator from "csv-file-validator";
import { ContactRow } from "./interface";
import { ListingRow } from "../listing/interface";

class ContactService {
    public listingsFilePath = path.join(__dirname, "..", "/db/listings.csv");
    public contactsFilePath = path.join(__dirname, "..", "/db/contacts.csv");

    getAveragePriceByIds = (listingIds: string[]) => {
        const listingsSet = new Set(listingIds);
        let totalPrice = 0;

        return new Promise((resolve, reject) => {
            fs.createReadStream(this.listingsFilePath)
                .pipe(csv())
                .on("data", (data: ListingRow) => {
                    if (listingsSet.has(data.id)) {
                        totalPrice += Number(data.price);
                    }
                })
                .on("end", () => {
                    resolve(totalPrice / listingIds.length);
                })
                .on("error", (error) => reject(error));
        });
    };

    getAvgPriceOfMostContacted = () => {
        const resultsMap = new Map<string, number>();

        return new Promise((resolve, reject) => {
            // count the total number of items in the contacts sheet
            let totalItems = 0;

            fs.createReadStream(this.contactsFilePath)
                .pipe(csv())
                .on("data", (data: ContactRow) => {
                    const listingFrequency = resultsMap.has(data.listing_id)
                        ? resultsMap.get(data.listing_id) + 1
                        : 1;
                    resultsMap.set(data.listing_id, listingFrequency);
                    totalItems++;
                })
                .on("end", async () => {
                    const result = new Array<{
                        listing_id: string;
                        total: number;
                    }>();
                    for (const [key, value] of resultsMap) {
                        result.push({ listing_id: key, total: value });
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

                    const listingIds = new Array<string>();

                    // get 30% of most contacted listings
                    const size = Math.round(result.length * 0.3);

                    for (let i = 0; i < size; i++)
                        listingIds.push(result[i].listing_id);

                    const averagePrice = await this.getAveragePriceByIds(
                        listingIds
                    ).catch((e) => reject(e));

                    resolve(JSON.stringify(averagePrice));
                })
                .on("error", (error) => reject(error));
        });
    };

    getListingsDate = (listingArray: { id: string; total: number }[]) => {
        // map listing array to listing map
        const listingMap = new Map<
            string,
            { ranking: number; listingId: string; total: number }
        >();
        for (const [index, item] of listingArray.entries())
            listingMap.set(item.id, {
                ranking: index + 1,
                listingId: item.id,
                total: item.total,
            });

        const listingData = new Array<{
            ranking: number;
            listingId: string;
            make: string;
            price: number;
            mileage: number;
            total: number;
        }>();

        return new Promise((resolve, reject) => {
            fs.createReadStream(this.listingsFilePath)
                .pipe(csv())
                .on("data", (data: ListingRow) => {
                    if (listingMap.has(data.id)) {
                        listingData.push({
                            ...listingMap.get(data.id),
                            make: data.make,
                            price: Number(data.price),
                            mileage: Number(data.mileage),
                        });
                    }
                })
                .on("end", () => {
                    listingData.sort((a, b) => {
                        if (a.ranking < b.ranking) {
                            return -1;
                        } else if (a.ranking > b.ranking) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    resolve(listingData);
                })
                .on("error", (error) => reject(error));
        });
    };

    getMostContactedListings = () => {
        // aggregate by month
        const resultsMap: Map<number, Map<string, number>> = new Map<
            number,
            Map<string, number>
        >();

        return new Promise((resolve, reject) => {
            fs.createReadStream(this.contactsFilePath)
                .pipe(csv())
                .on("data", (data: ContactRow) => {
                    const listingId = String(data.listing_id);
                    const timestamp = Number(data.contact_date);
                    const formattedDate = new Date(timestamp);
                    const year = formattedDate.getFullYear();
                    const month = formattedDate.getMonth();
                    const mapKey = new Date(year, month).getTime();

                    if (resultsMap.has(mapKey)) {
                        const listingMap = resultsMap.get(mapKey);
                        if (listingMap.has(listingId)) {
                            listingMap.set(
                                listingId,
                                listingMap.get(listingId) + 1
                            );
                        } else {
                            listingMap.set(listingId, 1);
                        }
                    } else {
                        const listingMap = new Map<string, number>();
                        listingMap.set(listingId, 1);
                        resultsMap.set(mapKey, listingMap);
                    }
                })
                .on("end", async () => {
                    const result = new Array<{
                        month: number;
                        data: {
                            ranking: number;
                            listingId: string;
                            make: string;
                            price: number;
                            mileage: number;
                            total: number;
                        }[];
                    }>();
                    for (const [key, value] of resultsMap) {
                        const listingArray = new Array<{
                            id: string;
                            total: number;
                        }>();
                        for (const [listingKey, listingValue] of value)
                            listingArray.push({
                                id: listingKey,
                                total: listingValue,
                            });

                        // sort listing array descending by total
                        listingArray.sort((a, b) => {
                            if (a.total < b.total) {
                                return 1;
                            } else if (a.total > b.total) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });

                        const data: any = await this.getListingsDate(
                            listingArray.slice(0, 5)
                        ).catch((e) => reject(e));

                        result.push({
                            month: key,
                            data,
                        });
                    }

                    // sort end result ascending by month
                    result.sort((a, b) => {
                        if (a.month < b.month) {
                            return -1;
                        } else if (a.month > b.month) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });

                    resolve(JSON.stringify(result));
                })
                .on("error", (error) => reject(error));
        });
    };

    uploadContactsFile = async (file: UploadedFile) => {
        file.mv(file.name);
        const stream = fs.createReadStream(file.name);

        const config = {
            headers: [
                {
                    name: "listing_id",
                    inputName: "listing_id",
                    required: true,
                    validate: (listingId) => typeof listingId === "string",
                },
                {
                    name: "contact_date",
                    inputName: "contact_date",
                    required: true,
                    validate: (contactDate) => !isNaN(contactDate),
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
            file.mv(this.contactsFilePath);
            fs.unlinkSync(file.name);
            return "File saved successfully";
        }
    };
}

export default ContactService;
