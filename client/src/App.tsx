import React from "react";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import AverageListingSelling from "./components/AverageListingSelling";
import CarsDistribution from "./components/CarsDistribution";
import AveragePrice from "./components/AveragePrice";
import MostContactedListings from "./components/MostContactedListings";

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexGrow: 1,
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
}));

const TabPanel = (props: {
    children: React.ReactElement;
    index: number;
    value: number;
}) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`wrapped-tabpanel-${index}`}
            aria-labelledby={`wrapped-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={3}>{children}</Box>}
        </div>
    );
};

function App() {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);

    const handleChange = (event: any, newValue: number) => {
        setValue(newValue);
    };
    return (
        <Container component="main" maxWidth="md">
            <CssBaseline />
            <div className={classes.paper}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    <Tab label="Listing Selling Price" />
                    <Tab label="Cars Distribution" />
                    <Tab label="Average Price" />
                    <Tab label="Most Contacted Listings " />
                </Tabs>
                <TabPanel value={value} index={0}>
                    <AverageListingSelling />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <CarsDistribution />
                </TabPanel>
                <TabPanel value={value} index={2}>
                    <AveragePrice />
                </TabPanel>
                <TabPanel value={value} index={3}>
                    <MostContactedListings />
                </TabPanel>
            </div>
        </Container>
    );
}

export default App;
