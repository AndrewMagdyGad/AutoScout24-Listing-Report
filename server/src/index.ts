import App from "./app";
import ListingController from "./listing/controller";
import ContactController from "./contact/controller";

const app = new App([new ListingController(), new ContactController()], 8080);

app.listen();
