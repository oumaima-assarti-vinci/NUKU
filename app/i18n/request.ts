import { getRequestConfig } from "next-intl/server";

import fr_about from "../../messages/fr/about.json";
import fr_login from "../../messages/fr/login.json";
import fr_signup from "../../messages/fr/signup.json";
import fr_success from "../../messages/fr/success.json";
import fr_contact from "../../messages/fr/contact.json";
import fr_cart from "../../messages/fr/cart.json";
import fr_checkout from "../../messages/fr/checkout.json";
import fr_home from "../../messages/fr/home.json";
import fr_shop from "../../messages/fr/shop.json";
import fr_subscription from "../../messages/fr/subscription.json";
import fr_buildpack from "../../messages/fr/build-pack.json";
import fr_packs from "../../messages/fr/packs.json";
import fr_product from "../../messages/fr/product.json";

import en_about from "../../messages/en/about.json";
import en_login from "../../messages/en/login.json";
import en_signup from "../../messages/en/signup.json";
import en_success from "../../messages/en/success.json";
import en_contact from "../../messages/en/contact.json";
import en_cart from "../../messages/en/cart.json";
import en_checkout from "../../messages/en/checkout.json";
import en_home from "../../messages/en/home.json";
import en_shop from "../../messages/en/shop.json";
import en_subscription from "../../messages/en/subscription.json";
import en_buildpack from "../../messages/en/build-pack.json";
import en_packs from "../../messages/en/packs.json";
import en_product from "../../messages/en/product.json";

import nl_about from "../../messages/nl/about.json";
import nl_login from "../../messages/nl/login.json";
import nl_signup from "../../messages/nl/signup.json";
import nl_success from "../../messages/nl/success.json";
import nl_contact from "../../messages/nl/contact.json";
import nl_cart from "../../messages/nl/cart.json";
import nl_checkout from "../../messages/nl/checkout.json";
import nl_home from "../../messages/nl/home.json";
import nl_shop from "../../messages/nl/shop.json";
import nl_subscription from "../../messages/nl/subscription.json";
import nl_buildpack from "../../messages/nl/build-pack.json";
import nl_packs from "../../messages/nl/packs.json";
import nl_product from "../../messages/nl/product.json";

const messages = {
  fr: { about: fr_about, login: fr_login, signup: fr_signup, success: fr_success, contact: fr_contact, cart: fr_cart, checkout: fr_checkout, home: fr_home, shop: fr_shop, subscription: fr_subscription, "build-pack": fr_buildpack, packs: fr_packs, product: fr_product },
  en: { about: en_about, login: en_login, signup: en_signup, success: en_success, contact: en_contact, cart: en_cart, checkout: en_checkout, home: en_home, shop: en_shop, subscription: en_subscription, "build-pack": en_buildpack, packs: en_packs, product: en_product },
  nl: { about: nl_about, login: nl_login, signup: nl_signup, success: nl_success, contact: nl_contact, cart: nl_cart, checkout: nl_checkout, home: nl_home, shop: nl_shop, subscription: nl_subscription, "build-pack": nl_buildpack, packs: nl_packs, product: nl_product },
};

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? "fr";
  return {
    locale,
    messages: messages[locale as keyof typeof messages],
  };
});