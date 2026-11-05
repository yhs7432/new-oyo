import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import CataloguePage from "../pages/catalogue/page";
import ProductDetailPage from "../pages/product/page";
import AdminPage from "../pages/admin/page";
import AboutPage from "../pages/about/page";
import OrderingPage from "../pages/how-to-order/page";
import NewsPage from "../pages/news/page";
import ContactPage from "../pages/contact/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/products",
    element: <CataloguePage />,
  },
  {
    path: "/special-offers",
    element: <CataloguePage category="events" />,
  },
  {
    path: "/used-clubs",
    element: <CataloguePage category="used" />,
  },
  {
    path: "/accessories",
    element: <CataloguePage category="accessories" />,
  },
  {
    path: "/products/:id",
    element: <ProductDetailPage />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/how-to-order",
    element: <OrderingPage />,
  },
  {
    path: "/news",
    element: <NewsPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;