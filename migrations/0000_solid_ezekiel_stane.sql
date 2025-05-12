CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"response" text NOT NULL,
	"is_advanced" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "forum_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"source" text,
	"url" text,
	"published_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"activity_type" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"roll_number" text NOT NULL,
	"department" text DEFAULT 'ECE' NOT NULL,
	"year" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
