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
    table: {
        minWidth: 700,
    },
});

export default function AveragePrice() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const url = `${baseUrl}/contact/average-price-most-contacted`;
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
        <TableContainer component={Paper}>
            <Typography
                variant="h5"
                gutterBottom
                align="center"
                style={{ padding: "15px" }}
            >
                Average price of the 30% most contacted listings
            </Typography>
            {loading && (
                <div style={{ textAlign: "center", padding: "15px" }}>
                    <CircularProgress />
                </div>
            )}
            {!loading && data && (
                <Table className={classes.table} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell align="center">
                                Average Price
                            </StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <StyledTableRow>
                            <StyledTableCell align="center">
                                {"€ " + data.toFixed(3) + ",-"}
                            </StyledTableCell>
                        </StyledTableRow>
                    </TableBody>
                </Table>
            )}
        </TableContainer>
    );
}
