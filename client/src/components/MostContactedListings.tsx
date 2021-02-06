import React, { useState, useEffect } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import { baseUrl } from "../utils";

const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 16,
    },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
    root: {
        "&:nth-of-type(odd)": {
            backgroundColor: theme.palette.action.hover,
        },
    },
}))(TableRow);

const useStyles = makeStyles({
    table: { minWidth: 700 },
});

interface IData {
    month: number;
    data: {
        ranking: number;
        listingId: string;
        total: number;
        make: string;
        price: number;
        mileage: number;
    }[];
}

export default function MostContactedListings() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<IData[] | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const url = `${baseUrl}/contact/most-contacted-listings`;
                const requestOptions = { method: "GET" };
                const response = await fetch(url, requestOptions);
                const responseData = await response.json();

                if (response.ok) {
                    setData(responseData);
                }
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div>
            <Typography
                variant="h5"
                gutterBottom
                align="center"
                style={{ padding: "15px" }}
            >
                The Top 5 most contacted listings per Month
            </Typography>
            {loading && (
                <div style={{ textAlign: "center", padding: "15px" }}>
                    <CircularProgress />
                </div>
            )}
            {!loading &&
                data &&
                data.map((row, index) => (
                    <TableContainer component={Paper} key={index}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            align="center"
                            style={{ padding: "15px" }}
                        >
                            {new Date(row.month).toDateString()}
                        </Typography>
                        <Table
                            className={classes.table}
                            aria-label="customized table"
                        >
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center">
                                        Ranking
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        Listing Id
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        Make
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        Selling Price
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        Mileage
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        Total Amount of contacts
                                    </StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {row.data.map((item, index) => (
                                    <StyledTableRow key={index}>
                                        <StyledTableCell align="center">
                                            {item.ranking}
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            {item.listingId}
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            {item.make}
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            {"€ " +
                                                item.price.toFixed(3) +
                                                ",-"}
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            {item.mileage.toFixed(3) + " KM"}
                                        </StyledTableCell>
                                        <StyledTableCell align="center">
                                            {item.total}
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ))}
        </div>
    );
}
