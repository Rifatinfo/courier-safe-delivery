import { Router } from "express";
import { UserRoutes } from "../user/user.routes";
import { AdminRoutes } from "../admin/admin.routes";
import { AuthRoutes } from "../auth/auth.routes";
import { PaymentRoutes } from "../payment/payment.routes";
import { BookingRoutes } from "../booking/booking.routes";

export const router = Router();

const moduleRouters = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
  {
    path: "/booking",
    route: BookingRoutes,
  },
];

moduleRouters.forEach((route) => {
  router.use(route.path, route.route);
});
