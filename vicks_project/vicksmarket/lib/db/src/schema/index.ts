import { pgTable, text, uuid, integer, numeric, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Enums ──
export const roleEnum = pgEnum("role", ["customer", "merchant", "admin"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "shipped", "delivered", "cancelled"]);

// ── profiles (mirrors Supabase auth.users) ──
export const profilesTable = pgTable("profiles", {
  id:          uuid("id").primaryKey(),
  fullName:    text("full_name"),
  shopName:    text("shop_name"),
  phone:       text("phone"),
  photoURL:    text("photo_url"),
  role:        text("role").default("customer"),
  uniqueId:    text("unique_id"),
  isVerified:  boolean("is_verified").default(false),
  location:    text("location"),
  createdAt:   timestamp("created_at").defaultNow(),
});

// ── stores ──
export const storesTable = pgTable("stores", {
  id:          uuid("id").primaryKey().defaultRandom(),
  ownerId:     uuid("owner_id").references(() => profilesTable.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  description: text("description"),
  logoUrl:     text("logo_url"),
  location:    text("location"),
  phone:       text("phone"),
  telegram:    text("telegram"),
  isVerified:  boolean("is_verified").default(false),
  isGold:      boolean("is_gold").default(false),
  createdAt:   timestamp("created_at").defaultNow(),
});

// ── products ──
export const productsTable = pgTable("products", {
  id:          uuid("id").primaryKey().defaultRandom(),
  sellerId:    uuid("seller_id").references(() => profilesTable.id, { onDelete: "cascade" }),
  name:        text("name").notNull(),
  description: text("description"),
  price:       numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl:    text("image_url"),
  category:    text("category"),
  mall:        text("mall"),
  phone:       text("phone"),
  telegram:    text("telegram"),
  likes:       integer("likes").default(0),
  views:       integer("views").default(0),
  rating:      numeric("rating", { precision: 3, scale: 2 }).default("0"),
  ratingCount: integer("rating_count").default(0),
  createdAt:   timestamp("created_at").defaultNow(),
});

// ── orders ──
export const ordersTable = pgTable("orders", {
  id:         uuid("id").primaryKey().defaultRandom(),
  buyerId:    uuid("buyer_id").references(() => profilesTable.id, { onDelete: "set null" }),
  sellerId:   uuid("seller_id").references(() => profilesTable.id, { onDelete: "set null" }),
  productId:  uuid("product_id").references(() => productsTable.id, { onDelete: "set null" }),
  status:     text("status").default("pending"),
  quantity:   integer("quantity").default(1),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }),
  notes:      text("notes"),
  createdAt:  timestamp("created_at").defaultNow(),
});

// ── Insert schemas ──
export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, likes: true, views: true, ratingCount: true });
export const insertOrderSchema   = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });

export type Profile = typeof profilesTable.$inferSelect;
export type Store   = typeof storesTable.$inferSelect;
export type Product = typeof productsTable.$inferSelect;
export type Order   = typeof ordersTable.$inferSelect;
