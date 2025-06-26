--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ListingStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ListingStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."ListingStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: collection_price_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collection_price_history (
    id text NOT NULL,
    land_listing_id text NOT NULL,
    price_type character varying(20) NOT NULL,
    price double precision NOT NULL,
    previous_price double precision,
    change_percentage double precision,
    bid_id text,
    transaction_id text,
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.collection_price_history OWNER TO postgres;

--
-- Name: evm_collection_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evm_collection_tokens (
    id text NOT NULL,
    land_listing_id text NOT NULL,
    nft_id text,
    token_id integer NOT NULL,
    is_main_token boolean DEFAULT false NOT NULL,
    token_uri text NOT NULL,
    owner_address text,
    mint_transaction_hash text,
    mint_timestamp timestamp(3) without time zone,
    mint_status text DEFAULT 'NOT_STARTED'::text NOT NULL,
    is_listed boolean DEFAULT false NOT NULL,
    listing_price double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.evm_collection_tokens OWNER TO postgres;

--
-- Name: kyc_update_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kyc_update_requests (
    id text NOT NULL,
    "userId" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    changes jsonb NOT NULL,
    "adminNotes" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.kyc_update_requests OWNER TO postgres;

--
-- Name: land_listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.land_listings (
    id text NOT NULL,
    "userId" text NOT NULL,
    title_deed_file_ref text,
    "deedNumber" text,
    "deedType" text,
    "grantorName" text,
    "granteeName" text,
    "deedDate" date,
    title_cert_file_ref text,
    "certNumber" text,
    cert_issue_date date,
    legal_description text,
    parcel_number text,
    property_address text,
    city text,
    state text,
    zip_code text,
    country text,
    latitude double precision,
    longitude double precision,
    property_type text,
    property_area_sqm double precision,
    property_description text,
    listing_title text,
    listing_price double precision,
    price_currency text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    mint_status text,
    mint_error_reason text,
    mint_timestamp timestamp(3) without time zone,
    mint_transaction_hash text,
    token_id integer,
    contract_address text,
    collection_id text,
    main_token_id text,
    slug text,
    cover_image_url text,
    nft_description text,
    nft_title text,
    nft_image_file_ref text,
    nft_collection_size integer DEFAULT 10,
    marketplace_listing_id integer,
    marketplace_listing_error text,
    nft_image_irys_uri text,
    nft_metadata_irys_uri text,
    local_government_area text,
    property_valuation text,
    zoning_classification text,
    child_tokens_base_url text,
    collection_metadata_url text,
    collection_nft_title text,
    main_token_metadata_url text,
    marketplace_transaction_hash text,
    creator_address text,
    rejection_reason text,
    status public."ListingStatus" DEFAULT 'PENDING'::public."ListingStatus" NOT NULL
);


ALTER TABLE public.land_listings OWNER TO postgres;

--
-- Name: nft_bids; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nft_bids (
    id text NOT NULL,
    land_listing_id text NOT NULL,
    bidder_user_id text NOT NULL,
    bid_amount double precision NOT NULL,
    bid_status character varying(20) NOT NULL,
    transaction_hash character varying(66),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    token_id integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.nft_bids OWNER TO postgres;

--
-- Name: nft_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nft_transactions (
    id text NOT NULL,
    land_listing_id text NOT NULL,
    token_id integer NOT NULL,
    from_address character varying(42) NOT NULL,
    to_address character varying(42) NOT NULL,
    price double precision NOT NULL,
    transaction_hash character varying(66) NOT NULL,
    transaction_type character varying(20) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nft_transactions OWNER TO postgres;

--
-- Name: nfts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nfts (
    id text NOT NULL,
    name text NOT NULL,
    "itemNumber" integer NOT NULL,
    image text NOT NULL,
    price double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "propertyId" text,
    "ownerId" text,
    "isListed" boolean DEFAULT false NOT NULL,
    land_listing_id text
);


ALTER TABLE public.nfts OWNER TO postgres;

--
-- Name: offers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.offers (
    id text NOT NULL,
    "nftId" text NOT NULL,
    "offererId" text NOT NULL,
    price double precision NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text
);


ALTER TABLE public.offers OWNER TO postgres;

--
-- Name: properties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.properties (
    id text NOT NULL,
    name text NOT NULL,
    items integer NOT NULL,
    volume double precision DEFAULT 0 NOT NULL,
    "floorPrice" double precision NOT NULL,
    image text NOT NULL,
    category text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL,
    description text
);


ALTER TABLE public.properties OWNER TO postgres;

--
-- Name: trades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trades (
    id text NOT NULL,
    "nftId" text NOT NULL,
    "buyerId" text NOT NULL,
    "sellerId" text NOT NULL,
    price double precision NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "creatorId" text
);


ALTER TABLE public.trades OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    username character varying(50),
    email character varying(255),
    password_hash character varying(255),
    full_name character varying(100),
    address_line1 character varying(255),
    address_line2 character varying(255),
    city character varying(100),
    state_province character varying(100),
    postal_code character varying(20),
    country character varying(100),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    sign_in_nonce character varying(255),
    evm_address character varying(42),
    date_of_birth date,
    gov_id_ref text,
    gov_id_type character varying(50),
    kyc_verified boolean DEFAULT false NOT NULL,
    phone character varying(20),
    auth_type character varying(20) DEFAULT 'email'::character varying NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    wallet_address character varying(42)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: watchlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watchlist (
    id text NOT NULL,
    "userId" text NOT NULL,
    "collectionId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.watchlist OWNER TO postgres;

--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e075a3d6-c94c-44e5-82aa-502ebcb54d66	603faeedf51a51d3807354ab325ab913ddb170e9f60b70581d5e8caabd548af3	2025-05-12 17:44:29.784264+01	20250512164429_init	\N	\N	2025-05-12 17:44:29.751498+01	1
5a7ec2ad-58ac-47bf-ac08-615e16059799	9be32ed4e4babe43f0f6b6473685a4bc5c6380243e1ec5b87819770051eaa7ec	2025-05-18 22:18:07.511725+01	20250518211807_update_listing_for_collections	\N	\N	2025-05-18 22:18:07.500629+01	1
b26e75cf-ed6c-439b-bc4d-5a3a5a846c3f	60c98600183a9f2fa583843c5fe98ea476c310f788487337b2db09e24ba9867c	2025-05-18 22:24:05.59625+01	20250518212405_add_marketplace_tx_hash_to_listing	\N	\N	2025-05-18 22:24:05.594287+01	1
795cf62e-63a8-475a-bbdc-a274494a6873	383ff60a731e86ee79132ca7b7858e06c6be864fb5db89cb7ae8f342b173421b	2025-05-19 01:41:43.525862+01	20250519004143_set_collection_size_default_to_10	\N	\N	2025-05-19 01:41:43.522518+01	1
f23067b1-c28f-4054-8d53-c96b12e1701a	500e2c05082928d04b7c7d04111efcd232bc480d6aed8b45f48d0b903af82158	2025-05-27 01:21:16.03013+01	20250527002115_add_collection_price_tracking	\N	\N	2025-05-27 01:21:16.019765+01	1
2eadeae8-30a0-4def-a961-c9e67a730129	96229df8536667c7d48af6275fac850e0dbd90ab39833c56f23e056acf937eb4	2025-05-27 02:33:02.132845+01	20250527013212_add_token_id_to_bids	\N	\N	2025-05-27 02:33:02.121468+01	1
ea61fea0-7ef0-4c43-bdb4-98bbbcad1b8a	395ee9773b013314ac79175c0d442942f28e02f554d43edd9c2e0688c74c2313	2025-06-12 00:47:03.884528+01	20250611234703_add_creator_address_to_listing	\N	\N	2025-06-12 00:47:03.878529+01	1
\.


--
-- Data for Name: collection_price_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collection_price_history (id, land_listing_id, price_type, price, previous_price, change_percentage, bid_id, transaction_id, metadata, created_at) FROM stdin;
cmb5s84pz0001cz39277fwybc	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	\N	\N	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:32:35.303
cmb5s84q70003cz391py593tb	cmb2wcefj0000czlrzwoxaitp	BID_PLACED	0.5	\N	\N	test-bid-id	\N	{"bidId": "test-bid-id", "eventType": "BID_PLACED"}	2025-05-27 00:32:35.311
cmb5sine20001czzaqo33wg1w	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	\N	\N	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:40:46.059
cmb5sinek0003czzawvdq8sku	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	\N	\N	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:40:46.077
cmb5sjojx0005czzalhb9jf3t	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:41:34.221
cmb5sjokf0007czzaimek9u20	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:41:34.239
cmb5sjolg0009czzauq8s9ey6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:41:34.276
cmb5sjoll000bczzaxx1x3bwh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:41:34.282
cmb5snl7g0001czt5ha0y84wh	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:44:36.509
cmb5snl7u0003czt53sid9fxh	cmb2wcefj0000czlrzwoxaitp	BID_PLACED	0.5	0.5	0	test-bid-id	\N	{"bidId": "test-bid-id", "eventType": "BID_PLACED"}	2025-05-27 00:44:36.523
cmb5sojs6000dczzaa7a6y029	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:45:21.318
cmb5sojso000fczzakdjvgrbp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:45:21.337
cmb5sojtt000hczzaxsf5ct8y	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:45:21.377
cmb5soju1000jczza31g10cmn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:45:21.385
cmb5str9u000lczzaxtqrutn0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:49:24.307
cmb5strae000nczzage5e4d0o	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:49:24.327
cmb5svbjr000pczza52cjeppl	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:50:37.24
cmb5svbkz000rczzaq4p6eyzy	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:50:37.283
cmb5svxlm000tczza1adctbk4	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:51:05.819
cmb5svxm7000vczzacbelnm0a	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:51:05.839
cmb5sw326000xczza6evgl1mp	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:51:12.894
cmb5swq0a000zczzawv60641b	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:51:42.634
cmb5swq0q0011czzarpk8un7y	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:51:42.65
cmb5swq1w0013czzaqddgkgx9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:51:42.692
cmb5swq210015czza8cds9ewz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:51:42.697
cmb5sx24x0017czza8kg7m38y	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:51:58.353
cmb5sx25h0019czza5f24zsa8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:51:58.374
cmb5sx26i001bczzarlzkyyvf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:51:58.411
cmb5sx26o001dczzarrnt65hk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:51:58.417
cmb5t2gd3001fczzah204pgi9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:56:10.072
cmb5t2gda001hczzab96qn0p3	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:56:10.079
cmb5t2gel001jczzavlwunsa1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 00:56:10.125
cmb5t2get001lczza1qufrfva	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 00:56:10.133
cmb5tjxa2001nczzaxqyovusf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:09:45.147
cmb5tjxab001pczza2guk7vak	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:09:45.155
cmb5tjxbw001rczzafwm3xbv0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:09:45.213
cmb5tjxc2001tczzaufhv6l42	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:09:45.218
cmb5trzgo0001czza0qsg5sjn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:16:01.224
cmb5trzh40003czzasv90mtpp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:16:01.241
cmb5trzil0005czzap4gl6zfb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:16:01.294
cmb5trzir0007czzas0589yvm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:16:01.3
cmb5tt66r0009czzaicckfiha	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:16:56.595
cmb5tt671000bczzaq2mx2ul4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:16:56.606
cmb5tt68b000dczza5yq304r9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:16:56.651
cmb5tt68f000fczzagcqbgg8s	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:16:56.656
cmb5tzfxq000hczzac3iuumo8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:21:49.167
cmb5tzfyk000jczzaj5vrv28u	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:21:49.196
cmb5tzlv9000lczzaz7ik2tnu	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:21:56.853
cmb5tzlxn000nczzayancilom	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:21:56.94
cmb5u7i1k000pczzak747dv4k	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:28:05.144
cmb5u7i1p000rczzawslzrprp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:28:05.15
cmb5u8thr000tczzazbw4i496	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:29:06.639
cmb5u8tip000vczzaz8ngdr64	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:29:06.674
cmb5uyuo7000xczzajn5rjaoz	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:49:21.223
cmb5uyuom000zczzau7ge3jpa	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:49:21.239
cmb5uyuox0011czzaj4jhbyy7	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:49:21.249
cmb5uzj4k0013czzadjzjg7wa	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:49:52.915
cmb5uzj550015czzaze7rm64i	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:49:52.937
cmb5uzjqv0017czzaeb939jlg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:49:53.72
cmb5v05tp0019czzaygsvkbb2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:50:22.333
cmb5v05uc001bczzabzmo6ivq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:50:22.356
cmb5v06v4001dczzaqhdey1c7	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:50:23.68
cmb5v0sv4001fczzarxziov5v	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:50:52.192
cmb5v0sv9001hczzamnetsi96	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:50:52.197
cmb5v0u08001jczza91nfmt9a	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:50:53.673
cmb5v1g17001lczza3zjcq9xv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:51:22.22
cmb5v1g1l001nczzay03uqggt	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:51:22.234
cmb5v1h6i001pczza6okk6vv0	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:51:23.706
cmb5v236g001rczzaumngi66f	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:51:52.216
cmb5v236l001tczzarcb9zrrn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:51:52.221
cmb5v24bc001vczzabu9y0j5n	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:51:53.688
cmb5v2iel0003czonv9kn3dhg	cmb2wcefj0000czlrzwoxaitp	BID_ACCEPTED	0.5	\N	\N	test-bid-acceptance	\N	{"bidId": "test-bid-acceptance", "eventType": "BID_ACCEPTED"}	2025-05-27 01:52:11.949
cmb5v2iet0005czonrwlijcen	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:52:11.957
cmb5v2ihn001xczza53luowm9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:52:12.06
cmb5v2qbf001zczzanec7k0r6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:52:22.204
cmb5v2qbj0021czzago06rd55	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:52:22.208
cmb5v2rg90023czzavgrlzr5b	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:52:23.673
cmb5v3dgh0025czza4rrdequw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:52:52.194
cmb5v3dgu0027czzaji9sdple	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:52:52.207
cmb5v3elx0029czzambm9n31n	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:52:53.685
cmb5v40ly002bczza5t8zauws	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:53:22.199
cmb5v40m1002dczzaahaxdll4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:53:22.202
cmb5v41r2002fczza0ii9d28d	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:53:23.679
cmb5v4nrb002hczzavd6df2sw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:53:52.2
cmb5v4nrn002jczzank9kw6s4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:53:52.212
cmb5v4ow8002lczzalmo4phso	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:53:53.672
cmb5v5awh002nczzabus286vs	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:54:22.193
cmb5v5awk002pczza7oyoshm9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:54:22.196
cmb5v5c1e002rczza5fstcx9h	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:54:23.666
cmb5v5y1y002tczzatrvzl5y1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:54:52.198
cmb5v5y2a002vczzag0cfca9a	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:54:52.211
cmb5v5z7b002xczzavgzo1sk3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:54:53.687
cmb5v6l74002zczza8tk7jcsy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:55:22.192
cmb5v6l7g0031czzakfl4jvso	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:55:22.205
cmb5v6mc00033czzaetiunel1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:55:23.665
cmb5v78ck0035czza7zjeq2ob	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:55:52.196
cmb5v78cm0037czzamk7stotd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:55:52.199
cmb5v79hl0039czzaj1jb79nh	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:55:53.674
cmb5v7vhz003bczzatznzn21z	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:56:22.199
cmb5v7vib003dczza7q3rp4nd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:56:22.212
cmb5v7wmw003fczzaqaylhuhi	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:56:23.673
cmb5v8iqp003hczza5ua7d3fh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:56:52.322
cmb5v8ir5003jczzaemi452yg	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:56:52.338
cmb5v8vtz003lczzamxckag16	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:57:09.287
cmb5v8vvo003nczzavrp5nx3v	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:57:09.348
cmb5v95wb003pczza5thxboe0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:57:22.332
cmb5v95wp003rczza1i1snpsi	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:57:22.346
cmb5v9hdt003tczza3sgoxj6r	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:57:37.217
cmb5v9he7003vczzaoqaccqxj	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:57:37.232
cmb5v9heu003xczzac2eop90u	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:57:37.254
cmb5v9hex003zczza4s8jti43	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:57:37.258
cmb5v9sxb0041czzaeidox9s3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:57:52.176
cmb5v9sxo0043czza2uxc742h	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:57:52.189
cmb5va9nb0045czzaz6fnz9q3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:58:13.846
cmb5va9nr0047czzac3smyfj0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:58:13.863
cmb5vaa290049czzan13fbjp4	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:58:14.386
cmb5vaa2o004bczza5gok2kk7	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:58:14.401
cmb5vawr7004dczzagc8qzekx	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:58:43.795
cmb5vawrl004fczzaoesy02ui	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:58:43.81
cmb5vb22p004hczzahex2fbkr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:58:50.69
cmb5vb22s004jczzaq8wq2rfz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:58:50.693
cmb5vbaj3004pczzazlqqkn16	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:59:01.648
cmb5vbaji004rczza957acap1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:59:01.662
cmb5vbxkq004tczzavxjh7grc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 01:59:31.515
cmb5vbxl5004vczzax38vq3ej	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 3, "acceptedBidsCount": 3}	2025-05-27 01:59:31.53
cmb5yc9d80001cz51lywns0hf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:23:45.635
cmb5yc9df0003cz51szgq9gbl	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:23:45.651
cmb5yc9ft0005cz51were0n8w	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:23:45.737
cmb5yc9fy0007cz51n9v60ke6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:23:45.742
cmb5yd3ns0009cz5147c72eso	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:24:24.905
cmb5yd3nx000bcz51ffsvlznc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:24:24.91
cmb5ydakz000dcz51lvsne5av	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:24:33.876
cmb5ydal7000fcz51y4882mg6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:24:33.883
cmb5ydam3000hcz513mqlmpr3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:24:33.915
cmb5ydam7000jcz515k9dd075	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:24:33.92
cmb5ydqq8000lcz51z4evwnxr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:24:54.8
cmb5ydqql000ncz51kto32ul0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:24:54.813
cmb5ye6pm000pcz51lwcmeios	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:25:15.515
cmb5ye6q0000rcz51l1epa3lw	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:25:15.528
cmb5yedy6000tcz517d82q8nx	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:25:24.894
cmb5yedyk000vcz51vfa1m1mv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:25:24.909
cmb5yfdv2000xcz513absybal	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:26:11.438
cmb5yfdwb000zcz51fr5z1sht	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:26:11.483
cmb5ygaj20011cz510ow2urf1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:26:53.774
cmb5ygjo00013cz51w9z37b23	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:27:05.616
cmb5ygjpg0015cz51sff8jcw6	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:27:05.669
cmb5ygzde0017cz51gwzf4lt2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:27:25.971
cmb5yhg2t0019cz514i0xcjpv	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:27:47.621
cmb5yhktr001bcz5126j18t3n	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:27:53.776
cmb5yi3af001dcz51xlsuptz9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:28:17.704
cmb5yi7z9001fcz51kt47r9qv	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:28:23.781
cmb5yipxt001jcz51gmtnlxw6	cmb2wcefj0000czlrzwoxaitp	BID_PLACED	0.001	0.5	-99.8	cmb5yipx0001hcz51zge82wyz	\N	{"bidId": "cmb5yipx0001hcz51zge82wyz", "eventType": "BID_PLACED"}	2025-05-27 03:28:47.058
cmb5yjl6d001ncz51uu9o3090	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:29:27.541
cmb5yjl83001pcz514a175o3k	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:29:27.604
cmb5yjnfp001rcz516hs2n7wd	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:29:30.47
cmb5yjngi001tcz51903uzont	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:29:30.498
cmb5yjuzx001vcz51pc9fwn4c	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:29:40.269
cmb5yk7o8001xcz51qbv1abre	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:29:56.696
cmb5ykg4i001zcz51vfvoiynu	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:30:07.65
cmb5yl3e10021cz513vtezxug	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:30:37.802
cmb5ylhvt0023cz512hhdhkyo	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:30:56.585
cmb5ylqe50025cz51og56sods	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:31:07.613
cmb5ymdjn0027cz51s4gajn3b	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:31:37.619
cmb5yms6i0029cz5164lu5u4p	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:31:56.586
cmb5yn0ou002bcz51ngyz9n09	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:32:07.614
cmb5ynnu0002dcz51ljmn3t7o	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:32:37.608
cmb5yo2h6002fcz51doe493wa	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:32:56.587
cmb5yoazf002hcz51tpavl9mh	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:33:07.611
cmb5yoyna002jcz51te0yjcq8	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:33:38.279
cmb5ypl6p002lcz51r4ykl1ux	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:34:07.489
cmb5ypstq002ncz51xpby805k	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:34:17.391
cmb5yq8kj002pcz518pels8zf	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:34:37.795
cmb5yqn2w002rcz51gavhpo9h	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:34:56.6
cmb5yqvme002tcz51eyfqgqn1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:35:07.67
cmb5yrirg002vcz51e0tqq43r	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:35:37.66
cmb5yrxdi002xcz51f44tia6p	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:35:56.598
cmb5ys5vm002zcz51rroffikz	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:36:07.619
cmb5yst0x0031cz515r64yf0k	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:36:37.617
cmb5yt7o70033cz51czcseg73	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:36:56.6
cmb5ytg640035cz51wgie0kyg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:37:07.613
cmb5yu3bg0037cz51t39wb5ti	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:37:37.613
cmb5yuhyp0039cz5178via7ei	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:37:56.594
cmb5yuqgw003bcz51zihhnlmx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:38:07.616
cmb5yvdmg003dcz51pzd8quba	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:38:37.624
cmb5yvs8x003fcz51sigygu51	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:38:56.577
cmb5yw0rg003hcz51zffixsqd	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:39:07.613
cmb5ywnwo003jcz517gxux4ur	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:39:37.608
cmb5yx2kg003lcz51zydis5pn	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:39:56.609
cmb5yxb5a003ncz51dnst51g2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:40:07.726
cmb5yxya9003pcz513gm6xbqx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:40:37.713
cmb5yycuo003rcz51slxmtfw1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:40:56.592
cmb5yyld1003tcz51xa4hbo8a	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:41:07.622
cmb5yz8ic003vcz51u6syh5sy	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:41:37.621
cmb5yzn57003xcz513ty9q3f4	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:41:56.587
cmb5yzvnp003zcz5170x5ti5e	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:42:07.622
cmb5z0it20041cz51xjnhnvln	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:42:37.622
cmb5z0xg40043cz51lrxmj1kk	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:42:56.597
cmb5z15y80045cz515tzfpgqf	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:43:07.616
cmb5z1t5n0047cz513cw6ygzt	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:43:37.691
cmb5z27r30049cz51bq0140ul	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:43:56.607
cmb5z2gat004bcz51i2unxt68	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:44:07.685
cmb5z33ee004dcz51r9j67uub	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:44:37.623
cmb5z3i1t004fcz51awhg6jou	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:44:56.609
cmb5z3qlb004hcz5107cjepbf	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:45:07.68
cmb5z4doz004jcz516rc9h7cs	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:45:37.62
cmb5z4sj8004lcz51yemagwow	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:45:56.852
cmb5z5115004ncz51isf5vzcv	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:46:07.865
cmb5z5em4004pcz51x67xfqad	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:46:25.469
cmb5z5v6d004rcz51vkhmqua2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:46:46.934
cmb5z62pf004tcz51654ftp1c	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:46:56.691
cmb5z69ho004vcz511wscnvqp	cmb2wcefj0000czlrzwoxaitp	BID_ACCEPTED	0.001	0.5	-99.8	cmb5yipx0001hcz51zge82wyz	\N	{"bidId": "cmb5yipx0001hcz51zge82wyz", "eventType": "BID_ACCEPTED"}	2025-05-27 03:47:05.484
cmb5z69hs004xcz51v3co7rqy	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:47:05.488
cmb5z69hv004zcz51xymhy7oj	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	\N	\N	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:47:05.491
cmb5z6b4t0053cz51gdipgp0a	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:47:07.614
cmb5z6b570055cz51kpkdc9oj	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:47:07.628
cmb5z6z460057cz51vada6oyd	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:47:38.694
cmb5z6z4v0059cz512m35v2fy	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:47:38.719
cmb5z7cyj005bcz51huieul2v	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:47:56.635
cmb5z7cyz005dcz51bn33h5jd	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:47:56.651
cmb5z7lfz005fcz515dlxie8w	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:48:07.632
cmb5z7lg4005hcz51ohcagx1b	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:48:07.637
cmb5z88kv005jcz51rr60vb9v	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:48:37.616
cmb5z88l9005lcz51wz7ap9xq	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:48:37.629
cmb5z8n7y005ncz51h0tl3gc2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:48:56.591
cmb5z8n8b005pcz513uuw50mm	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:48:56.604
cmb5z8vqd005rcz51xau1wdl9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:49:07.621
cmb5z8vqp005tcz51x3fqz6er	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:49:07.634
cmb5z9ivr005vcz514vaunpwm	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:49:37.624
cmb5z9ivu005xcz510jb6vltj	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:49:37.627
cmb5z9xiq005zcz5180g16ciw	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:49:56.594
cmb5z9xjs0061cz51pzrk75w5	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:49:56.632
cmb5za6110063cz51drjwwcj2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:50:07.622
cmb5za61e0065cz51176vngty	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:50:07.635
cmb5zat690067cz51dvqxuckm	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:50:37.617
cmb5zat6c0069cz51ldswb5sn	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:50:37.62
cmb5zb7tb006bcz511clpml2t	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:50:56.592
cmb5zb7ue006dcz51qjq6b9nq	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:50:56.63
cmb5zbgbp006fcz51jnu2melh	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:51:07.621
cmb5zbgc1006hcz513safj0ft	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:51:07.633
cmb5zc3hs006jcz51wp1wr810	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:51:37.648
cmb5zc3hw006lcz514wmymrce	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:51:37.653
cmb5zcjmn006ncz514npskwj6	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:51:58.559
cmb5zcjn2006pcz51sli9hwtw	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:51:58.575
cmb5zcqmv006rcz51qvpkzo3d	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:52:07.639
cmb5zcqnb006tcz510hzfeqa7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:52:07.656
cmb5zcu6c006vcz5128amloyr	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:52:12.229
cmb5zcu6u006xcz51wig6ddvz	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:52:12.246
cmb5zdpj6006zcz517wxzzln5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:52:52.867
cmb5zdpjo0071cz51e396ukka	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:52:52.884
cmb5zdser0073cz51vsxuxraa	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:52:56.596
cmb5zdsew0075cz516f81ah1t	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:52:56.6
cmb5zeckl0077cz51df1xs8f0	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:53:22.725
cmb5zecl10079cz51gqa532lk	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:53:22.741
cmb5zezqc007bcz51y9uav40d	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:53:52.74
cmb5zezqg007dcz51icbut55u	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:53:52.744
cmb5zf2qg007fcz51szjpgu55	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:53:56.633
cmb5zf2qx007hcz517kqmiz2m	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:53:56.649
cmb5zfxk5007jcz51j7c2kgsv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:54:36.581
cmb5zfxkw007lcz51yqlkvfii	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:54:36.608
cmb5zfxm7007ncz516oyc60lk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:54:36.655
cmb5zfxmb007pcz51nomgweov	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:54:36.66
cmb5zgd4h007rcz51cytwxkl5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:54:56.753
cmb5zgd4x007tcz51ok2ufp50	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:54:56.769
cmb5zgu68007vcz51evny4862	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:55:18.848
cmb5zgu6m007xcz51vmpawu6v	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:55:18.863
cmb5zhhcm007zcz51qc54dtrr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:55:48.887
cmb5zhhd20081cz51hydlfyrd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:55:48.902
cmb5zhnbb0083cz510f0ghig1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:55:56.615
cmb5zhnbr0085cz51plyrxdh6	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:55:56.631
cmb5zi4h70087cz515k96d10d	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:56:18.859
cmb5zi4hf0089cz51mplq30nc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:56:18.868
cmb5zirls008bcz512bhaxehg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:56:48.832
cmb5zirm2008dcz519kz7mlj8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:56:48.843
cmb5zixln008fcz51ouiifeir	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:56:56.604
cmb5zixm3008hcz51svdbfxnt	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:56:56.619
cmb5zjes8008jcz51ahmsb1vd	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:57:18.873
cmb5zjeso008lcz51wh6kowyf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:57:18.888
cmb5zk1wo008ncz51iz684pgz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:57:48.84
cmb5zk1ws008pcz51vdejzjlq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:57:48.844
cmb5zk7wg008rcz517d20tg5c	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:57:56.608
cmb5zk7wv008tcz51jrv9ig6o	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:57:56.623
cmb5zkp1v008vcz51a84avs96	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:58:18.835
cmb5zkp2c008xcz51cue90jyk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:58:18.853
cmb5zlc71008zcz518sp6gxel	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:58:48.83
cmb5zlc7h0091cz51qnlbppog	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:58:48.845
cmb5zli6s0093cz51ki3yb4au	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:58:56.596
cmb5zli760095cz51lbi2w0bx	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:58:56.611
cmb5zlzcp0097cz51kl40mae8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:59:18.841
cmb5zlzct0099cz51ospt370g	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:59:18.845
cmb5zmmik009bcz511vxdsipx	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:59:48.86
cmb5zmmix009dcz51m1kk9gfj	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:59:48.874
cmb5zmshx009fcz51osi9hpgc	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 03:59:56.614
cmb5zmsib009hcz51g0y3bk1g	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 03:59:56.627
cmb5zn9ol009jcz515gqjp3l5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:00:18.886
cmb5zn9p1009lcz51dho6blll	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:00:18.901
cmb5znwt1009ncz51vzvnq0ds	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:00:48.854
cmb5znwu7009pcz51urphhgy8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:00:48.895
cmb5zo2sn009rcz51xobfk44m	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:00:56.615
cmb5zo2t1009tcz51zw27edim	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:00:56.629
cmb5zojye009vcz51qwz3vftn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:01:18.854
cmb5zojyi009xcz51tzpj80f8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:01:18.858
cmb5zp73p009zcz51rtk3t55h	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:01:48.854
cmb5zp74400a1cz51l1o0kfn4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:01:48.868
cmb5zpd3200a3cz51tuv4eglw	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:01:56.606
cmb5zpd3g00a5cz51pnq702pi	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:01:56.62
cmb5zpu9c00a7cz51bdomlio0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:02:18.864
cmb5zpu9t00a9cz51tcti2hot	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:02:18.881
cmb5zqhej00abcz51ur5e0oxu	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:02:48.859
cmb5zqhem00adcz51etvtc0aa	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:02:48.863
cmb5zqndn00afcz51rkywa0we	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:02:56.603
cmb5zqne300ahcz51pwjtphzn	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:02:56.619
cmb5zr4ju00ajcz51083u79tl	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:03:18.859
cmb5zr4ka00alcz51dmxw28a5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:03:18.875
cmb5zrrp500ancz51qq6urmb6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:03:48.857
cmb5zrrpi00apcz51khf43sr3	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:03:48.871
cmb5zrxo900arcz51qh4kz9ps	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:03:56.602
cmb5zrxop00atcz51dvkjqeov	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:03:56.617
cmb5zseuw00avcz51hoyt3rgg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:04:18.872
cmb5zseuz00axcz51paxahjkp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:04:18.876
cmb5zt1zz00azcz51dqojetgr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:04:48.863
cmb5zt20g00b1cz51252z7ks3	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:04:48.88
cmb5zt7zb00b3cz51ijjancry	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:04:56.615
cmb5zt7zp00b5cz51h6qgkcq8	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:04:56.629
cmb5ztp5700b7cz51adgja2ql	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:05:18.859
cmb5ztp5m00b9cz51biakm2vp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:05:18.874
cmb5zucau00bbcz51bl03lngm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:05:48.87
cmb5zucaz00bdcz51r9qh2brm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:05:48.875
cmb5zui9w00bfcz51uupkdiw6	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:05:56.613
cmb5zuiaa00bhcz51knaolz8f	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:05:56.626
cmb5zuzfl00bjcz51y339krc6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:06:18.85
cmb5zuzg300blcz512fqok55r	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:06:18.867
cmb5zvml400bncz51abfym2b1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:06:48.856
cmb5zvmm800bpcz51q70iwl9m	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:06:48.896
cmb5zvskp00brcz51dfyz8p0w	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:06:56.617
cmb5zvsl300btcz51wv3btnma	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:06:56.631
cmb5zw9qn00bvcz51bjfgy1u8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:07:18.864
cmb5zw9qr00bxcz519x4cixrd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:07:18.868
cmb5zwwvz00bzcz51nn3nppt5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:07:48.864
cmb5zwwwd00c1cz51l966xekj	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:07:48.878
cmb5zx2v900c3cz513w6h7lo9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:07:56.614
cmb5zx2vn00c5cz51lmu0frg6	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:07:56.627
cmb5zxk1600c7cz51rb6fu8a2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:08:18.858
cmb5zxk1a00c9cz51hus7boix	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:08:18.862
cmb5zy76h00cbcz519odsugui	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:08:48.858
cmb5zy76v00cdcz51fxtib6o9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:08:48.872
cmb5zyd6100cfcz51jc67ueeb	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:08:56.617
cmb5zyd6h00chcz51uvsy94c1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:08:56.634
cmb5zyubz00cjcz51khq9nzq5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:09:18.863
cmb5zyucc00clcz51dhc6wq45	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:09:18.877
cmb5zzhhb00cncz51s3rilwrm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:09:48.863
cmb5zzhhe00cpcz51fl3e7523	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:09:48.867
cmb5zzngi00crcz51sir5h999	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:09:56.61
cmb5zzngv00ctcz51tn5i4e20	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:09:56.624
cmb6004mg00cvcz51y8jcx2rn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:10:18.857
cmb6004mx00cxcz51qui4chlr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:10:18.873
cmb600rs900czcz51k193s38w	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:10:48.873
cmb600rse00d1cz51hwacktez	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:10:48.879
cmb600xr900d3cz51ne589akc	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:10:56.613
cmb600xrm00d5cz51zx1pznau	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:10:56.626
cmb601ex900d7cz515vo6nd7f	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:11:18.861
cmb601exq00d9cz51o3v8zsyy	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:11:18.878
cmb60222m00dbcz51a32bigl5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:11:48.862
cmb60222z00ddcz51bdg1bknr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:11:48.876
cmb60282a00dfcz51qsxlpjwj	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:11:56.626
cmb60282o00dhcz515pnlgw48	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:11:56.641
cmb602p8000djcz51v45x03g3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:12:18.864
cmb602p8800dlcz51pam2qlcp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:12:18.872
cmb603cd100dncz51zoyciqjn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:12:48.854
cmb603cdf00dpcz51wekhofap	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:12:48.868
cmb603id000drcz51dvgub3pe	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:12:56.628
cmb603idd00dtcz51mig8eltq	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:12:56.642
cmb603zia00dvcz516ilg6kys	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:13:18.85
cmb603zie00dxcz51977d5zv9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:13:18.854
cmb604mnq00dzcz51acr30e4t	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:13:48.855
cmb604mo400e1cz51usovqheh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:13:48.869
cmb604sng00e3cz51ixtwa14o	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:13:56.62
cmb604snp00e5cz51vovhebeb	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:13:56.629
cmb6059t900e7cz51kvxb2fcz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:14:18.862
cmb6059tq00e9cz51zbuxti1h	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:14:18.878
cmb605wys00ebcz510rp7uzs5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:14:48.868
cmb605wyv00edcz51oyte8sr8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:14:48.872
cmb6062yu00efcz51u0yur5si	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:14:56.646
cmb6062zb00ehcz51n01q8pj9	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:14:56.663
cmb606k3u00ejcz51px1d4fwn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:15:18.858
cmb606k4700elcz51gd278jbv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:15:18.872
cmb60779400encz51uux079li	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:15:48.857
cmb60779w00epcz51vfskzkko	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:15:48.884
cmb607d8d00ercz51t8vm9c01	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:15:56.605
cmb607d9d00etcz51v5klee5z	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:15:56.642
cmb607uea00evcz51312gpf7f	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:16:18.85
cmb607uee00excz51nu0i73kq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:16:18.855
cmb608hjp00ezcz51zh4c1lyr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:16:48.853
cmb608hk400f1cz51ed4jd45s	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:16:48.868
cmb608nja00f3cz51xhq8cpeh	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:16:56.614
cmb608njq00f5cz51yhgnfxmn	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:16:56.631
cmb6094p400f7cz5136onr2j9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:17:18.856
cmb6094pi00f9cz51lydm1bgi	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:17:18.871
cmb609rud00fbcz51qt2oh5z0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:17:48.853
cmb609ruh00fdcz51gwnt5oat	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:17:48.857
cmb609xu000ffcz5117c819aq	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:17:56.616
cmb609xud00fhcz510ijbwkrd	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:17:56.63
cmb60aezo00fjcz510sbz7015	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:18:18.852
cmb60af0200flcz513euv7aiu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:18:18.867
cmb60b25300fncz51i046bn1i	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:18:48.856
cmb60b25h00fpcz51j9trcj6q	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:18:48.869
cmb60b84w00frcz51w35j3qu7	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:18:56.624
cmb60b85c00ftcz51iik380m3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:18:56.64
cmb60bpb500fvcz51n55cma7c	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:19:18.881
cmb60bpb900fxcz51lrazbf68	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:19:18.886
cmb60ccg700fzcz5186y2nh6r	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:19:48.871
cmb60ccgl00g1cz51g8eih7yk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:19:48.885
cmb60cifo00g3cz518oilw0gq	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:19:56.628
cmb60cig200g5cz51uguvcnm6	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:19:56.643
cmb60czl300g7cz51puphsjoj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:20:18.856
cmb60czll00g9cz51y5vvz4sk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:20:18.873
cmb60dmqi00gbcz51b2sezfee	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:20:48.858
cmb60dmqm00gdcz51rtx5i0js	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:20:48.862
cmb60dsqz00gfcz51om8aju5b	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:20:56.651
cmb60dss500ghcz5133vfit3j	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:20:56.694
cmb60e7tx00gjcz51pok9nrpb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:21:16.198
cmb60e80500glcz51nek73bkc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:21:16.421
cmb60f36l00gncz51ceohvpkp	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:21:56.83
cmb60f36p00gpcz51qbu1ggec	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:21:56.833
cmb60f37000grcz51jwwp9syh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:21:56.845
cmb60f37000gtcz513nw1btgq	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:21:56.845
cmb60fq4i00gvcz510m3mwphs	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:22:26.563
cmb60fq4q00gxcz51cijtmoqi	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:22:26.57
cmb60gda200gzcz51n5vg18ml	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:22:56.57
cmb60gdam00h1cz51g7dqq6q8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:22:56.591
cmb60gdax00h3cz51rksb31nx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:22:56.601
cmb60gdb700h5cz51tvab3hcw	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:22:56.611
cmb60h0ek00h7cz51yyyobftw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:23:26.541
cmb60h0ex00h9cz51nwt6t7q6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:23:26.553
cmb60hnl900hbcz51f27ovw8h	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:23:56.589
cmb60hnlu00hdcz5132wbmu7p	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:23:56.61
cmb60hnmb00hfcz51engr6jh7	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:23:56.628
cmb60hnmk00hhcz5141wm5drw	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:23:56.636
cmb60iapz00hjcz51kh49idgy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:24:26.567
cmb60iaqc00hlcz51lb6i7wbe	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:24:26.58
cmb60ixvv00hncz51hnk1awpe	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:24:56.587
cmb60ixw800hpcz512ybcn4uu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:24:56.601
cmb60ixwp00hrcz518r9g7esc	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:24:56.617
cmb60ixxa00htcz51c24n8knh	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:24:56.638
cmb60jl0x00hvcz510hhusl1i	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:25:26.578
cmb60jl1200hxcz516emtizmd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:25:26.583
cmb60k85y00hzcz515xae8gjt	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:25:56.566
cmb60k87200i3cz51wugweza7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:25:56.606
cmb60lii300ihcz51gbtqf7q4	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:26:56.619
cmb6ipwze00epczd4txdaghkg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:54:15.097
cmb6ipwzs00erczd4uwxlcr8o	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:54:15.113
cmb6iqk9h00evczd41h6820h7	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:54:45.269
cmb6iqp6r00exczd43flek5do	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:54:51.651
cmb6iqp7a00ezczd49rlk23qo	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:54:51.67
cmb6ir6te00f1czd4pa30fxp6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:55:14.498
cmb6ir6th00f3czd4033201nw	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:55:14.501
cmb6irtzf00f5czd4ursgfj1t	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:55:44.524
cmb6irtzu00f7czd46xyyt97c	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:55:44.538
cmb6ishap00fdczd4j6of801s	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:56:14.738
cmb6ishby00ffczd4ow7vd2f0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:56:14.783
cmb6it49l00fhczd4hkz1lruf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:56:44.505
cmb6it49x00fjczd4g74meqfr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:56:44.518
cmb6it9qx00fpczd4ott12kq3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:56:51.609
cmb6it9r000frczd4wy47eaeb	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:56:51.613
cmb6itren00ftczd4d70idz1i	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:57:14.495
cmb6itreq00fvczd400shwczf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:57:14.499
cmb6iuejx00fxczd4fdzzgwlk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:57:44.494
cmb6iuekb00fzczd4k017ddqs	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:57:44.507
cmb6iuk1q00g1czd4afka0bkc	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:57:51.614
cmb6iuk2200g3czd4rd55yzr2	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:57:51.626
cmb6iwz5k00glczd4ik27lpkz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:59:44.505
cmb6iwz5o00gnczd4ejgwzbgh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:59:44.508
cmb6ix4my00gpczd43w1y85sf	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:59:51.611
cmb6ix4n100grczd4qo5oq5jt	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:59:51.614
cmb6ixmb000gtczd4yflb8dup	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:00:14.509
cmb6ixmbe00gvczd4wycaz14i	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:00:14.522
cmb6iy9kt00gxczd4u7lp1h04	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:00:44.669
cmb6iy9l700gzczd42v6dy6o2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:00:44.683
cmb6iyf9j00h1czd4bhi09p5r	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:00:52.039
cmb6iyfa300h3czd4g4j1f65e	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:00:52.06
cmb6iyxxp00h5czd46gepzb73	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:01:16.237
cmb60k86b00i1cz51z4110g6g	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:25:56.579
cmb60k87200i5cz517txxx64b	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:25:56.607
cmb60kvbm00i7cz51itsvl8nv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:26:26.578
cmb60kvbu00i9cz51fy9k4qf4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:26:26.586
cmb60ligq00ibcz5117oyvu77	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:26:56.57
cmb60lihv00idcz517s3l8s9g	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:26:56.611
cmb60lihy00ifcz514tskyuf9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:26:56.614
cmb60m5n300ijcz51ln79egy9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:27:26.607
cmb60m5nc00ilcz51gz4euwml	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:27:26.616
cmb60msr200incz51ru9jk5iy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:27:56.558
cmb60msri00ipcz51tb8w8pg8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:27:56.574
cmb60msso00ircz511rd738hy	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:27:56.617
cmb60mssy00itcz51ncltx8jx	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:27:56.626
cmb60nfwx00ivcz51l8st35pr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:28:26.577
cmb60nfxc00ixcz51hulxxjwc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:28:26.592
cmb60o32h00izcz51ibrebo1b	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:28:56.586
cmb60o32w00j1cz51tyg82614	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:28:56.6
cmb60o33m00j3cz510si8pkp6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:28:56.626
cmb60o33m00j5cz51adl2njyo	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:28:56.626
cmb60oq7b00j7cz51bvfv59yc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:29:26.568
cmb60oq7g00j9cz51t9vefgwi	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:29:26.572
cmb60pdcu00jbcz51lvsk6ags	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:29:56.575
cmb60pdd600jdcz51dpdz268w	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:29:56.586
cmb60pddz00jfcz51ljrs31ub	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:29:56.616
cmb60pddz00jhcz51c3kyyqco	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:29:56.616
cmb60q0h700jjcz51ypibjczf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:30:26.54
cmb60q0hd00jlcz51co4jstms	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:30:26.545
cmb60qnnp00jncz515ly661yu	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:30:56.581
cmb60qno800jpcz517d9oxv5k	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:30:56.6
cmb60qnou00jrcz51b2ol055q	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:30:56.622
cmb60qnou00jtcz518703zmw0	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:30:56.623
cmb60rasy00jvcz51uti7vxeu	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:31:26.579
cmb60ratt00jxcz517e6fvxnt	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:31:26.609
cmb60rxy900jzcz51lpgnplnn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:31:56.578
cmb60rxyh00k1cz51ctj1q8v9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:31:56.585
cmb60rxym00k3cz51j5i6oxa8	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:31:56.59
cmb60rxys00k5cz51txsueqwx	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:31:56.596
cmb60sl3k00k7cz513p6iam7m	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:32:26.576
cmb60sl3r00k9cz5101pumywc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:32:26.584
cmb60t89400kbcz51pra82fxp	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:32:56.584
cmb60t8ap00kdcz51c9sukw61	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:32:56.641
cmb60t8b000kfcz51glmgtkjl	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:32:56.653
cmb60t8b200khcz51kgg5qzii	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:32:56.654
cmb60tve500kjcz51gnnx8rd0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:33:26.574
cmb60tvea00klcz51n23zeg7t	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:33:26.578
cmb60uijk00kncz51jsvficgk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:33:56.576
cmb60uik100kpcz51fi8ma1zn	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:33:56.594
cmb60uikp00krcz51fu2igc6b	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:33:56.617
cmb60uikp00ktcz51f2jemr3x	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:33:56.618
cmb60v5p000kvcz51wn9yjoi7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:34:26.58
cmb60v5p400kxcz51fa5293wu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:34:26.584
cmb60vsu500kzcz51vtj51cos	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:34:56.573
cmb60vsun00l1cz51h8xsynxo	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:34:56.591
cmb60vsun00l3cz51yjqrz6yz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:34:56.592
cmb60vsus00l5cz51wilpq6cj	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:34:56.597
cmb60wfz900l7cz51rlxz9xpv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:35:26.566
cmb60wfzk00l9cz51bdx0yk7m	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:35:26.577
cmb60x35000lbcz510209idn3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:35:56.58
cmb60x35c00ldcz519ta7q2v8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:35:56.593
cmb60x36100lfcz51e2f09d9z	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:35:56.617
cmb60x36900lhcz51ics6h3fe	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:35:56.625
cmb60xqax00ljcz51rqo05g0f	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:36:26.602
cmb60xqb500llcz5104caf21f	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:36:26.609
cmb60ydfc00lncz519je9v8mf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:36:56.569
cmb60ydfu00lpcz511bxsszh1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:36:56.587
cmb60ydgh00lrcz519te6z0fh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:36:56.61
cmb60ydgi00ltcz51o4eid7gv	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:36:56.61
cmb60z0kp00lvcz51zc5z690i	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:37:26.569
cmb60z0kv00lxcz51tqmg9c73	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:37:26.575
cmb60znqc00lzcz511e64sn74	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:37:56.58
cmb60znr400m1cz51lakrh0ql	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:37:56.608
cmb60znrm00m3cz510wgcf9sj	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:37:56.626
cmb60zns900m5cz511oyb7pua	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:37:56.625
cmb610av300m7cz51woeoo7ia	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:38:26.559
cmb610avi00m9cz51j76n41qk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:38:26.575
cmb610y0p00mbcz51656gicq9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:38:56.569
cmb610y0x00mdcz519k743yp8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:38:56.577
cmb610y1200mfcz51vz23qk0f	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:38:56.582
cmb610y1700mhcz51wl0ebayo	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:38:56.588
cmb611l5i00mjcz51smxnxohg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:39:26.55
cmb611l5y00mlcz51wuf009id	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:39:26.566
cmb6128by00mncz51g6y7rzgs	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:39:56.591
cmb6128c800mpcz51bqye91p7	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:39:56.6
cmb6128d300mrcz51ywm692ec	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:39:56.632
cmb6128d400mtcz51q1z9fqrf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:39:56.632
cmb612vh100mvcz519zo4sh42	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:40:26.581
cmb612vha00mxcz512a1q00nv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:40:26.59
cmb613imn00mzcz51k1ppo20i	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:40:56.591
cmb613imw00n1cz51d9denpww	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:40:56.6
cmb613inr00n3cz51u3ulv0g5	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:40:56.631
cmb613inr00n5cz51xxrjn5fc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:40:56.632
cmb6145rd00n7cz51pp73uhna	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:41:26.569
cmb6145ro00n9cz51qgg9twgh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:41:26.58
cmb614hkm00nbcz51zwuhha2d	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:41:41.879
cmb614hl800ndcz51athtq9ik	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:41:41.9
cmb614sxp00nfcz51j3dvoj8z	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:41:56.605
cmb614sxt00nhcz51mog9adkh	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:41:56.609
cmb615fed00njcz51v2dkha7x	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:42:25.717
cmb615fer00nlcz51zuvwqvcd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:42:25.731
cmb6162j200nncz51i38qohwk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:42:55.694
cmb6162ji00npcz51jc7gp8hn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:42:55.71
cmb61638p00nrcz51l5sf5gyc	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:42:56.617
cmb61638t00ntcz51pmzf67m8	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:42:56.621
cmb616pql00nvcz51jd00ubmj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:43:25.773
cmb616pr300nxcz51dsk5et5z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:43:25.791
cmb617cu200nzcz51vwczdmxr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:43:55.706
cmb617cug00o1cz51aow01ym5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:43:55.72
cmb617dj500o3cz51speq3m71	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:43:56.609
cmb617dji00o5cz5112aroraj	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:43:56.623
cmb617zzo00o7cz51mw2lrsbl	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:44:25.717
cmb617zzt00o9cz515x0imh5o	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:44:25.721
cmb618n4x00obcz51ktk3iwbh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:44:55.713
cmb618n5c00odcz51g9ugxppu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:44:55.728
cmb618ntt00ofcz51cpknqifv	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:44:56.609
cmb618nu600ohcz51jrwi7zmy	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:44:56.622
cmb619a9l00ojcz518z0lurf8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:45:25.69
cmb619aa200olcz51qygcsgzs	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:45:25.706
cmb619xfm00oncz51fvtg69ub	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:45:55.714
cmb619xfr00opcz51pzgmc18n	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:45:55.719
cmb619y4z00orcz516ftu00df	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:45:56.628
cmb619y5d00otcz51ajfmihmi	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:45:56.642
cmb61akln00ovcz510r9aote3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:46:25.739
cmb61akm200oxcz51qwnj29xi	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:46:25.755
cmb61b7qc00ozcz512ytuo7ln	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:46:55.716
cmb61b7qg00p1cz51422r76ot	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:46:55.721
cmb61b8fn00p3cz5147rh61d5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:46:56.628
cmb61b8g100p5cz512fl5ha94	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:46:56.642
cmb61buvl00p7cz51unl7vcdi	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:47:25.713
cmb61buvz00p9cz5127g1u2tp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:47:25.727
cmb61ci1800pbcz51lq45brqs	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:47:55.725
cmb61ci1p00pdcz51zgj6dzfo	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:47:55.741
cmb61ciq900pfcz511myvihyz	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:47:56.625
cmb61ciqm00phcz51pvfjftaa	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:47:56.639
cmb61d56m00pjcz51tuz4q7kc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:48:25.726
cmb61d56p00plcz51lo0z6rgu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:48:25.73
cmb61dsc200pncz51vhdfwttd	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:48:55.73
cmb61dscj00ppcz51e7jik800	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:48:55.747
cmb61dt0e00prcz51l1hs2qzx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:48:56.607
cmb61dt0s00ptcz51v7253wca	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:48:56.621
cmb61efgu00pvcz51n4ye72oa	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:49:25.71
cmb61efgy00pxcz51cash5xnf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:49:25.714
cmb61f2mi00pzcz51mjd2eife	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:49:55.722
cmb61f2n000q1cz51gfg55561	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:49:55.74
cmb61f3b100q3cz51vr197pnl	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:49:56.606
cmb61f3b500q5cz5167a4wrtu	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:49:56.61
cmb61fpri00q7cz510zcdqn95	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:50:25.71
cmb61fprw00q9cz51uzglem1z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:50:25.725
cmb61gcx400qbcz513dul1cj0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:50:55.721
cmb61gcx900qdcz51yka8dtvo	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:50:55.725
cmb61gdm500qfcz51axdr9lgf	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:50:56.621
cmb61gdmi00qhcz51zg7i6dr3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:50:56.635
cmb61h02i00qjcz51ma1sehi6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:51:25.723
cmb61h02x00qlcz51cx0pu7de	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:51:25.737
cmb61hn7q00qncz51eoelcwdh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:51:55.718
cmb61hn7u00qpcz51ewse7gdm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:51:55.722
cmb61hnwg00qrcz51i92u808z	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:51:56.609
cmb61hnwt00qtcz51k0bet0ie	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:51:56.622
cmb61iacz00qvcz51cgr30xhv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:52:25.716
cmb61iadh00qxcz51j5ujmxc8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:52:25.733
cmb61ixhf00qzcz5180tedejj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:52:55.684
cmb61ixhl00r1cz51wc0wiqkz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:52:55.689
cmb61iy7600r3cz51iy3hs4vk	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:52:56.611
cmb61iy7k00r5cz51gy0hcfag	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:52:56.624
cmb61jknn00r7cz51nqkyiprx	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:53:25.715
cmb61jko100r9cz51tailtj95	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:53:25.729
cmb61k7t000rbcz51b4q5b2j0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:53:55.716
cmb61k7tr00rdcz51b4ft7dui	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:53:55.743
cmb61k8hv00rfcz51zsgxq3i0	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:53:56.611
cmb61k8i800rhcz51q0v5zfk9	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:53:56.625
cmb61kuy800rjcz51apj4ctao	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:54:25.712
cmb61kuyd00rlcz51ohtf3c9g	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:54:25.718
cmb61li3j00rncz51bmy51xj6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:54:55.712
cmb61li4000rpcz510etlch7z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:54:55.728
cmb61lisk00rrcz51rlemupcf	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:54:56.612
cmb61lit200rtcz51v6gxlrms	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:54:56.63
cmb61m59000rvcz51v4wn7924	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:55:25.716
cmb61m59e00rxcz51mqb98tgc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:55:25.731
cmb61mseg00rzcz5190krl1b1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:55:55.721
cmb61msek00s1cz51aniqp07z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:55:55.725
cmb61mt3f00s3cz510favzfty	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:55:56.619
cmb61mt3x00s5cz51bl6qwuc6	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:55:56.638
cmb61nfj200s7cz51tw5h7n0w	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:56:25.694
cmb61nfjg00s9cz518gegngnc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:56:25.708
cmb61o2p900sbcz518wzrr7sw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:56:55.725
cmb61o2po00sdcz51oih7ihzg	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:56:55.74
cmb61o3e000sfcz51j6l39sy4	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:56:56.616
cmb61o3ee00shcz51gelw4iyq	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:56:56.63
cmb61opu900sjcz513yimdbxf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:57:25.714
cmb61opud00slcz51eqoo0hcb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:57:25.718
cmb61pczl00sncz51rgu3uz08	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:57:55.714
cmb61pd0800spcz5117vx96ue	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:57:55.736
cmb61pdoo00srcz510lb9p16f	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:57:56.616
cmb61pdp100stcz51nlm33p6x	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:57:56.629
cmb61q04z00svcz51cnba2e4a	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:58:25.715
cmb61q05300sxcz51qnf8yjts	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:58:25.719
cmb61qnad00szcz51p8w122od	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:58:55.717
cmb61qnar00t1cz51ubhnx2l6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:58:55.731
cmb61qnzf00t3cz51r6vw67vh	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:58:56.619
cmb61qnzu00t5cz51a0l3pxci	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:58:56.634
cmb61raez00t7cz51bz015xk1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:59:25.692
cmb61raf400t9cz51gb5dksdl	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:59:25.696
cmb61rxl100tbcz51xvup5k88	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:59:55.718
cmb61rxlf00tdcz51kk9zmf4i	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:59:55.732
cmb61ry9800tfcz51u1lmve08	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 04:59:56.589
cmb61ry9m00thcz51ph6h3e23	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 04:59:56.602
cmb61skqi00tjcz51gv986m6q	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:00:25.722
cmb61skqw00tlcz51rleax8w0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:00:25.736
cmb61t7vp00tncz51hz67b7ch	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:00:55.718
cmb61t7w400tpcz51u6r4lgnn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:00:55.732
cmb61t8kp00trcz5152x7hb59	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:00:56.617
cmb61t8l200ttcz511w3pko6u	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:00:56.63
cmb61tv0u00tvcz51wbnws2gk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:01:25.71
cmb61tv1800txcz51ruo4onz3	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:01:25.725
cmb61ui6b00tzcz51s9w0s27z	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:01:55.715
cmb61ui6e00u1cz51q483l1bt	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:01:55.719
cmb61uivf00u3cz51qy025vrw	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:01:56.62
cmb61uivt00u5cz511brcdqv2	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:01:56.634
cmb61v5bw00u7cz51m5lev0mb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:02:25.724
cmb61v5cd00u9cz51th0974sp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:02:25.741
cmb61vsh000ubcz51c9d9emtk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:02:55.716
cmb61vsh400udcz51y2hqvmrz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:02:55.72
cmb61vt6400ufcz516gvxdicl	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:02:56.621
cmb61vt6k00uhcz51ki0u0wmg	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:02:56.637
cmb61wfm100ujcz5153sf4o4a	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:03:25.705
cmb61wfmf00ulcz51ro298cas	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:03:25.719
cmb61x2rp00uncz5116k5pv9v	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:03:55.717
cmb61x2rs00upcz518zdf2w93	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:03:55.721
cmb61x3gq00urcz51llkaxogh	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:03:56.619
cmb61x3h600utcz51d4lbswsr	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:03:56.634
cmb61xpwz00uvcz518ctpbmkv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:04:25.715
cmb61xpxd00uxcz51sl0qbi94	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:04:25.73
cmb61yd1n00uzcz51tfrrcu9m	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:04:55.692
cmb61yd2100v1cz51bx8xc7k6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:04:55.705
cmb61ydr500v3cz51zkt6mto1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:04:56.609
cmb61ydrj00v5cz51dcbk72i8	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:04:56.624
cmb61z07100v7cz51gpnt20uw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:05:25.694
cmb61z07500v9cz51eelckhzp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:05:25.697
cmb61zncf00vbcz51f7bcbkif	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:05:55.696
cmb61znct00vdcz514h4ni4r1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:05:55.71
cmb61zo2000vfcz51gz5e8fg9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:05:56.616
cmb61zo2h00vhcz51j0w9xh98	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:05:56.633
cmb620aig00vjcz51xz3ny58h	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:06:25.72
cmb620ait00vlcz51y7vytso3	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:06:25.734
cmb620xnp00vncz51cgwzulj4	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:06:55.717
cmb620xnu00vpcz51dhj3bbvw	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:06:55.722
cmb620ycw00vrcz5136alg1lk	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:06:56.624
cmb620yda00vtcz51a9r7qsva	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:06:56.639
cmb621ksu00vvcz51ow60n5w9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:07:25.711
cmb621kta00vxcz513by0kgj3	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:07:25.726
cmb6227yb00vzcz51zcsm9vpn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:07:55.715
cmb6227ys00w1cz51lhnh761w	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:07:55.732
cmb6228nd00w3cz51ng9kgt5j	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:07:56.618
cmb6228nr00w5cz51npfmjadi	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:07:56.632
cmb622v3k00w7cz51gf3kqyte	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:08:25.712
cmb622v3o00w9cz51t755fpxr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:08:25.716
cmb623i8y00wbcz51su7z62zn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:08:55.714
cmb623i9f00wdcz51f8i39s9e	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:08:55.732
cmb623ixk00wfcz5149eyti48	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:08:56.6
cmb623iyk00whcz51dsi6rerb	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:08:56.637
cmb6245eo00wjcz51372p6xwy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:09:25.728
cmb6245f200wlcz51hku67943	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:09:25.743
cmb624sjk00wncz514049rydf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:09:55.712
cmb624sjo00wpcz51rpp45p32	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:09:55.716
cmb624t8u00wrcz51lmlx4owe	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:09:56.622
cmb624t9800wtcz51yt37hc01	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:09:56.636
cmb625foz00wvcz513ib7l7gl	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:10:25.715
cmb625fpf00wxcz5120d3ouy6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:10:25.731
cmb6262tt00wzcz51qn7o86p1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:10:55.697
cmb6262u600x1cz51ru8ms1h6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:10:55.711
cmb6263je00x3cz519dncvyzm	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:10:56.618
cmb6263jr00x5cz5129gisslh	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:10:56.631
cmb626pzv00x7cz5110dg79ki	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:11:25.723
cmb626pzy00x9cz518pf5j3dv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:11:25.727
cmb627d5000xbcz51cl32z6li	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:11:55.717
cmb627d5h00xdcz516qc5pvhn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:11:55.733
cmb627duo00xfcz51e8m6yfn3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:11:56.64
cmb627dv300xhcz51mdaiccli	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:11:56.656
cmb6280ah00xjcz51mvufg5fi	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:12:25.721
cmb6280an00xlcz51k0mgke3m	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:12:25.727
cmb628nfq00xncz51ejocbnx8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:12:55.719
cmb628ng500xpcz513cdc2499	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:12:55.733
cmb628o4r00xrcz51fqqkv8n3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:12:56.62
cmb628o4v00xtcz51fatrp3lz	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:12:56.624
cmb629alb00xvcz51oes0ma4h	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:13:25.727
cmb629alp00xxcz51zpzj06by	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:13:25.742
cmb629xqf00xzcz515vvq9kl0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:13:55.719
cmb629xqi00y1cz5161jiqd00	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:13:55.723
cmb629yfr00y3cz51nunxmxar	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:13:56.631
cmb629ygj00y5cz51sm1w664u	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:13:56.659
cmb62akvh00y7cz51i88ju4jh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:14:25.709
cmb62akvv00y9cz51howavu5w	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:14:25.723
cmb62b81e00ybcz51k8olwcj0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:14:55.73
cmb62b81v00ydcz51q2csrsrp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:14:55.748
cmb62b8pg00yfcz519itc9l82	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:14:56.597
cmb62b8pu00yhcz51ofd7b54x	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:14:56.61
cmb62bv6g00yjcz51hwvcuji3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:15:25.72
cmb62bv6p00ylcz51sejbyjki	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:15:25.729
cmb62cibq00yncz51z2ukrdni	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:15:55.718
cmb62cic500ypcz51fdaizkjp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:15:55.734
cmb62cj0p00yrcz51ecp4lyei	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:15:56.618
cmb62cj1300ytcz51d783palo	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:15:56.632
cmb62d5gx00yvcz51d3twqdva	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:16:25.713
cmb62d5hb00yxcz51yeoeuosa	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:16:25.728
cmb62dsm600yzcz51osy7r5yn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:16:55.711
cmb62dsma00z1cz5184avrx4y	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:16:55.714
cmb62dtbl00z3cz51smhuiu9f	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:16:56.626
cmb62dtbz00z5cz51rd188bz7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:16:56.639
cmb62efrj00z7cz51o8e9fd34	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:17:25.711
cmb62efrz00z9cz51bkjim895	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:17:25.728
cmb62f2wr00zbcz519y1lthus	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:17:55.708
cmb62f2wv00zdcz51palgsby9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:17:55.712
cmb62f3m500zfcz51pjzt2t17	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:17:56.621
cmb62f3mh00zhcz512pbfv43t	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:17:56.634
cmb62fq2g00zjcz51ws3fsa4k	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:18:25.721
cmb62fq2u00zlcz51hw5vdhle	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:18:25.734
cmb62gd7f00zncz51jdi0lc4w	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:18:55.708
cmb62gd7t00zpcz51d3eimdqv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:18:55.722
cmb62gdwi00zrcz51lp2v9r8y	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:18:56.61
cmb62gdwv00ztcz51m9qswitq	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:18:56.624
cmb62h0d100zvcz51vdgm9h2e	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:19:25.718
cmb62h0d700zxcz51q554o2gn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:19:25.723
cmb62hni400zzcz51nehyh66v	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:19:55.708
cmb62hnii0101cz51heyzkan4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:19:55.722
cmb62ho730103cz51banbxjqo	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:19:56.607
cmb62ho7h0105cz51tfgvlen4	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:19:56.621
cmb62iamz0107cz51ibjwqbfx	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:20:25.691
cmb62ian30109cz517rch1mjh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:20:25.696
cmb62ixsa010bcz514n0cpwcm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:20:55.691
cmb62ixsp010dcz51gcxa3s2b	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:20:55.705
cmb62iyi6010fcz515z1h2arb	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:20:56.623
cmb62iyin010hcz51ghkylxkv	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:20:56.639
cmb62jky2010jcz51d0whabda	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:21:25.706
cmb62jky6010lcz516z3gdw3l	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:21:25.71
cmb62k83m010ncz51zbucww4x	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:21:55.714
cmb62k841010pcz51ub2trzgf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:21:55.729
cmb62k8t0010rcz51sv3ojbv0	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:21:56.629
cmb62k8tf010tcz51g0yvx5cd	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:21:56.644
cmb62kv8q010vcz5152pnrfrm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:22:25.707
cmb62kv8u010xcz51nao9gj2o	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:22:25.711
cmb62liec010zcz515b1a19tn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:22:55.717
cmb62lier0111cz51iwty8h4u	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:22:55.731
cmb62lj340113cz51mki1fvtd	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 05:22:56.609
cmb62lj3k0115cz51cew963dk	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 05:22:56.625
cmb6fng6m0117cz51zk3v38op	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:28:21.167
cmb6fng7d0119cz51sg3pnlr6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:28:21.193
cmb6fo305011bcz51u3bvsduq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:28:50.742
cmb6fo30l011dcz51jl5s5rsu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:28:50.757
cmb6fo3ok011fcz51eflylu2v	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:28:51.62
cmb6fo3oo011hcz51zqpcurla	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:28:51.625
cmb6foq5y011jcz511odgeujo	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:29:20.758
cmb6foq6d011lcz514vv6nglf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:29:20.773
cmb6fpdaw011ncz513qc02u4o	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:29:50.744
cmb6fpdaz011pcz512o6awj76	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:29:50.748
cmb6fpdz1011rcz51xhbq3u5k	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:29:51.614
cmb6fpdzg011tcz51zgwqd79d	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:29:51.628
cmb6fq0g3011vcz519vzdi45j	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:30:20.739
cmb6fq0gk011xcz51hgyhvm1s	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:30:20.756
cmb6fqnkv011zcz51kwi86bj6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:30:50.719
cmb6fqnl00121cz514zh3vmi9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:30:50.725
cmb6fqo9v0123cz51hqb3ucbn	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:30:51.62
cmb6fqoab0125cz51jitm4zlk	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:30:51.635
cmb6fraqr0127cz516hkoj0yh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:31:20.74
cmb6frar60129cz51uwua0ues	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:31:20.754
cmb6frxvm012bcz513k3nuph9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:31:50.722
cmb6frxw0012dcz51z1oh2hck	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:31:50.736
cmb6frynx012fcz51rkkklgyp	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:31:51.741
cmb6fryo2012hcz515dvnflgv	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:31:51.746
cmb6fsl0v012jcz514g7mc51a	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:32:20.719
cmb6fsl11012lcz51vta16rjz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:32:20.726
cmb6ft86b012ncz51jynhp4fl	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:32:50.724
cmb6ft86i012pcz512ragsvyk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:32:50.73
cmb6ft8vh012rcz51ugib9evh	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:32:51.629
cmb6ft8vl012tcz51gu4ds73q	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:32:51.633
cmb6ftvi0012vcz5199bk6nv5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:33:20.952
cmb6ftvih012xcz51eyez5fkp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:33:20.97
cmb6fuigs012zcz51tx8hg3o3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:33:50.716
cmb6fuih70131cz51gnsljyxx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:33:50.732
cmb6fuj820133cz51nvkp70uo	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:33:51.698
cmb6fuj870135cz518b35jfrf	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:33:51.703
cmb6fv5me0137cz51mzfq59f2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:34:20.726
cmb6fv5mt0139cz51ghokwk0w	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:34:20.742
cmb6fvsrc013bcz51t2gnittt	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:34:50.712
cmb6fvsrr013dcz519dofua7d	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:34:50.728
cmb6fvtgq013fcz51v36lv0vs	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:34:51.626
cmb6fvth4013hcz51ym4isegp	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:34:51.641
cmb6fwfyb013jcz51ww0k0uke	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:35:20.771
cmb6fwfyk013lcz51o2j6u7sy	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:35:20.781
cmb6fx32h013ncz51h8f1qs7y	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:35:50.729
cmb6fx32p013pcz518xlioeu2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:35:50.737
cmb6fx3tr013rcz51cct69hjy	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:35:51.712
cmb6fx3v9013tcz518ox5lxyu	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:35:51.765
cmb6fxq7k013vcz5163mxei7n	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:36:20.72
cmb6fxq7y013xcz51w1tnnmkk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:36:20.735
cmb6fygb3013zcz51jzytzrgk	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:36:54.543
cmb6fygby0141cz51wfzd53qk	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:36:54.574
cmb6fygcd0143cz51nnvys2lq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:36:54.589
cmb6fygcz0145cz51r7lro974	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:36:54.612
cmb6fz0i30147cz5113lwaqip	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:37:20.715
cmb6fz0i70149cz516jgwc9m8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:37:20.72
cmb6fznnm014bcz51mjuhleqz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:37:50.722
cmb6fzno0014dcz51bvfukaqv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:37:50.736
cmb6fzoch014fcz5188ppsu6s	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:37:51.617
cmb6fzocv014hcz5154jqz9t4	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:37:51.631
cmb6g0atg014jcz512se7yk8v	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:38:20.741
cmb6g0atm014lcz51xqsvv5m4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:38:20.747
cmb6g0y50014ncz51y2fy42vn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:38:50.965
cmb6g0y5g014pcz51b9exug44	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:38:50.981
cmb6g0ypo014rcz519gso4o7c	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:38:51.709
cmb6g0yq4014tcz51g03wtmq3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:38:51.724
cmb6g1l4b014vcz513ub8qvwm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:39:20.747
cmb6g1l4i014xcz51njkekc9z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:39:20.755
cmb6g289u014zcz51wwoplzl1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:39:50.754
cmb6g289z0151cz51ucwh3yg1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:39:50.759
cmb6g28xu0153cz5100240gx8	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:39:51.618
cmb6g28xy0155cz51weip8mse	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:39:51.622
cmb6g2vkc0157cz516sm1mddl	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:40:20.941
cmb6g2vkp0159cz516dk9env8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:40:20.954
cmb6g3ije015bcz51lxrelevo	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:40:50.714
cmb6g3iji015dcz51ff8helah	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:40:50.719
cmb6g3j9g015fcz510fjecnmc	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:40:51.653
cmb6g3j9l015hcz51winpjfuv	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:40:51.658
cmb6g45pl015jcz518gd0xhio	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:41:20.746
cmb6g45py015lcz514wflb3dn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:41:20.759
cmb6g4suy015ncz515n1nm3j9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:41:50.746
cmb6g4sv4015pcz51fwpap19n	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:41:50.752
cmb6g4tj8015rcz51sk44ofri	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:41:51.62
cmb6g4tjm015tcz51gdjlpf68	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:41:51.635
cmb6g5fzv015vcz51g32ewimf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:42:20.731
cmb6g5g09015xcz51tqzt9vkd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:42:20.746
cmb6g635s015zcz51lic1r9ku	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:42:50.752
cmb6g63690161cz51gd01manc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:42:50.769
cmb6g63tv0163cz51daj02cg6	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:42:51.62
cmb6g63ua0165cz51qinzcuu0	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:42:51.634
cmb6g6qaw0167cz51zqn2kahy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:43:20.745
cmb6g6qb10169cz51ztg0ik3f	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:43:20.75
cmb6g7dfz016bcz51n1qp6at8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:43:50.736
cmb6g7dge016dcz51ef1s3ag1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:43:50.751
cmb6g7e4k016fcz511wzkqmr0	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:43:51.62
cmb6g7e4z016hcz519bejq4wf	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:43:51.635
cmb6g80ky016jcz5162rmdajm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:44:20.722
cmb6g80l2016lcz510az2j41p	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:44:20.726
cmb6g8npx016ncz51kp91zqs8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:44:50.71
cmb6g8nq2016pcz516p2lx9a9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:44:50.715
cmb6g8ofd016rcz51npzvqha3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:44:51.625
cmb6g8ofs016tcz51ykk0e9s8	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:44:51.641
cmb6g9avr016vcz51c66r2e4f	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:45:20.727
cmb6g9aw9016xcz51eyhvuldc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:45:20.745
cmb6g9y1k016zcz51spo3jzy9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:45:50.744
cmb6g9y1o0171cz516z53tutf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:45:50.749
cmb6g9ypr0173cz51sp46mhdj	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:45:51.616
cmb6g9yq60175cz51slg0tmyw	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:45:51.63
cmb6gal6w0177cz5114urji06	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:46:20.744
cmb6gal790179cz51s2ujx464	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:46:20.757
cmb6gb8bi017bcz51fi6ptaiw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:46:50.718
cmb6gb8c0017dcz51ulbrwap5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:46:50.736
cmb6gb90a017fcz51y327lb9a	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:46:51.61
cmb6gb90f017hcz51inge558d	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:46:51.615
cmb6gbvgs017jcz51uz00ht2v	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:47:20.717
cmb6gbvgz017lcz51f4pb4tw4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:47:20.723
cmb6gcilq017ncz51a6j6wzmw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:47:50.703
cmb6gcim3017pcz518nqmka8c	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:47:50.715
cmb6gcjap017rcz51etiy7h69	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:47:51.602
cmb6gcjav017tcz51ydbkoljk	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:47:51.607
cmb6gex3e0001czd0f1kyl61g	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:49:42.795
cmb6gex3z0003czd02uktkz9k	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:49:42.815
cmb6gf1qp0005czd09dsyo4rp	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:49:48.817
cmb6gf1t50007czd0jsgnxph0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:49:48.905
cmb6gf4xe0009czd0r2rsl0o3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:49:52.946
cmb6gf4xw000bczd0axsr5ywb	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:49:52.965
cmb6ggedk000dczd062j3c496	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:50:51.848
cmb6ggee2000fczd0uwtdvdzm	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:50:51.866
cmb6ggqfl000hczd0wjh28i8m	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:51:07.473
cmb6ggqfs000jczd022kochkp	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:51:07.481
cmb6ggqgv000lczd096mcvh7r	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:51:07.519
cmb6ggqh2000nczd0makwc4lk	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:51:07.526
cmb6ghokg000pczd04lwdmbt0	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:51:51.713
cmb6ghokl000rczd08jdu88sv	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:51:51.717
cmb6gi41e000tczd0yhtgfu52	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:52:11.763
cmb6gi41r000vczd02adyavd4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:52:11.775
cmb6gi43u000xczd0cga5iie1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:52:11.85
cmb6gi43z000zczd0yagmv8bp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:52:11.856
cmb6giq6w0011czd0290silq3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:52:40.473
cmb6giq7d0013czd05tvtqb9z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:52:40.49
cmb6giyup0015czd0w8g1tcn0	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:52:51.697
cmb6giyut0017czd09g4krj14	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:52:51.702
cmb6gk92o0019czd0npsqco1g	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:53:51.601
cmb6gk92s001bczd0ztun7tfi	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:53:51.604
cmb6gljd7001dczd028510wax	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:54:51.595
cmb6gljda001fczd086cn93t1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:54:51.598
cmb6gmtns001hczd0dbhy3fxn	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:55:51.593
cmb6gmtnw001jczd0esxm7ikn	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:55:51.596
cmb6go3yj001lczd0agadp4jy	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:56:51.596
cmb6go3ym001nczd0me9ckibh	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:56:51.599
cmb6gpe93001pczd0yroyl3id	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:57:51.592
cmb6gpe97001rczd0ju3lw3cu	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:57:51.595
cmb6gqoka001tczd0ri5hq4fb	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:58:51.611
cmb6gqoke001vczd07ke04z4o	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:58:51.614
cmb6gryul001xczd0cwymal7a	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 11:59:51.598
cmb6gryuy001zczd0o9mm5nd9	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 11:59:51.61
cmb6gt95c0021czd0bk85651i	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:00:51.601
cmb6gt95g0023czd09w6abwet	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:00:51.604
cmb6gujfv0025czd0g9l6qmzo	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:01:51.596
cmb6gujfy0027czd06bz807n7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:01:51.598
cmb6gvtqh0029czd0wabaw82j	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:02:51.594
cmb6gvtqk002bczd00dzgd1ut	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:02:51.596
cmb6gx417002dczd0jigf3q7j	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:03:51.595
cmb6gx41a002fczd0y6qjscmh	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:03:51.598
cmb6gxjqu002hczd0me3tg1jf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:04:11.958
cmb6gxjs5002jczd0gfq0zj4a	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:04:12.006
cmb6gyeey002lczd043jwx6rd	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:04:51.706
cmb6gyef2002nczd04yjxt25c	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:04:51.711
cmb6gzoqg002pczd0wpr42tyx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:05:51.736
cmb6gzoqu002rczd01v05zp1h	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:05:51.751
cmb6h03uo002tczd0lxpp6jea	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:06:11.329
cmb6h03v1002vczd01z7s9wbj	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:06:11.341
cmb6h0r0b002xczd0fmh8xyre	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:06:41.34
cmb6h0r0o002zczd0w0dgfzzw	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:06:41.353
cmb6h4r8m0001czd4j1qa0hep	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:09:48.262
cmb6h4r910003czd41h4sgztv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:09:48.278
cmb6h4tt20005czd4x5iiqfm3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:09:51.591
cmb6h4tt50007czd4ewemr2z7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:09:51.593
cmb6h591m0009czd4wc9lro9j	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:10:11.338
cmb6h591q000bczd4pfhf8ziv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:10:11.342
cmb6h5w6w000dczd4qxes4moq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:10:41.337
cmb6h5w7y000fczd4ksroatv6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:10:41.375
cmb6h644d000hczd42fxvpa8t	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:10:51.613
cmb6h644g000jczd4ulgm5ry4	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:10:51.617
cmb6h6jcg000lczd40pfse85b	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:11:11.345
cmb6h6jct000nczd4697qrjyq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:11:11.357
cmb6h6v6q000pczd4irppna1m	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:11:26.691
cmb6h6v72000rczd41b767gad	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:11:26.702
cmb6h7f16000tczd4z71pednf	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:11:52.41
cmb6h7f57000vczd4opu4tfbz	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:11:52.555
cmb6h7w29000xczd4r1wwc1pm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:12:14.481
cmb6h7w2d000zczd4402lfc8z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:12:14.485
cmb6h8j6r0011czd42v7cjgbb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:12:44.451
cmb6h8j6z0013czd4noenux9s	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:12:44.459
cmb6h8opd0015czd4iziu3nt3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:12:51.601
cmb6h8opp0017czd4staooylf	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:12:51.614
cmb6h969x0019czd440a5fayw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:13:14.374
cmb6h96aa001bczd4l1ols89y	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:13:14.386
cmb6h9tfr001dczd4qs01mib8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:13:44.392
cmb6h9tfw001fczd4n6tpz53f	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:13:44.396
cmb6h9z07001hczd4c7zy0u70	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:13:51.607
cmb6h9z0a001jczd4kdcpcy63	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:13:51.611
cmb6hagkx001lczd4d423jgem	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:14:14.385
cmb6haglb001nczd48ibomohr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:14:14.399
cmb6hb3q6001pczd448yh75ug	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:14:44.382
cmb6hb3qi001rczd49p37269a	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:14:44.394
cmb6hb9au001tczd4uxyl3gh8	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:14:51.607
cmb6hb9ay001vczd4896qgjme	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:14:51.61
cmb6hbqmd001xczd47csn4vqc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:15:14.054
cmb6hbqno001zczd4mko4212w	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:15:14.101
cmb6hcjop0021czd4c2p8mrqx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:15:51.722
cmb6hcjov0023czd4wgc3y7pk	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:15:51.727
cmb6hcu5c0025czd45ju5hv9q	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:16:05.28
cmb6hcu5o0027czd4hdj232kz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:16:05.293
cmb6hdhb90029czd4ifsz5983	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:16:35.301
cmb6hdhbk002bczd4veejc0nn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:16:35.313
cmb6hdtw7002dczd41htrkt0p	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:16:51.608
cmb6hdtwb002fczd4rz52dahp	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:16:51.611
cmb6he2r2002hczd4z4ksizkf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:17:03.086
cmb6he2rf002jczd4nbq6qy5o	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:17:03.1
cmb6hf4a0002lczd4qkbsqdhn	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:17:51.721
cmb6hf4a5002nczd4utdufmd1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:17:51.726
cmb6hf7d9002pczd4gt7s64hg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:17:55.725
cmb6hf7eb002rczd4zs7qyhff	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:17:55.763
cmb6hfuzy002tczd42p629jyq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:18:26.35
cmb6hfv0d002vczd4urj45kvu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:18:26.365
cmb6hgehj002xczd4eg7ehd5t	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:18:51.607
cmb6hgehm002zczd4j2jmh01e	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:18:51.61
cmb6hghnl0031czd4dnsqs1n2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:18:55.714
cmb6hghny0033czd44qloj79a	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:18:55.727
cmb6hh4uu0035czd4wywblqed	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:19:25.783
cmb6hh4v20037czd4vm6d75vh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:19:25.79
cmb6hhos90039czd4tmlubgbk	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:19:51.609
cmb6hhosc003bczd4lru31siq	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:19:51.612
cmb6hhryi003dczd4a72m3jnp	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:19:55.723
cmb6hhryk003fczd4tlywp53i	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:19:55.725
cmb6hif3v003hczd4pnc2o2zc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:20:25.723
cmb6hif47003jczd4yir6yaw0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:20:25.736
cmb6hiz2t003lczd4iry6jft3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:20:51.605
cmb6hiz2w003nczd48iuywndd	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:20:51.608
cmb6hj294003pczd4u4275jtn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:20:55.721
cmb6hj2a7003rczd4jcbn0z9h	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:20:55.759
cmb6hjpeh003tczd44ust9dzm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:21:25.722
cmb6hjpek003vczd4qsld4r10	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:21:25.724
cmb6hk9di003xczd45quwkd4x	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:21:51.606
cmb6hk9dl003zczd4ekx55k6j	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:21:51.609
cmb6hkcju0041czd4egn1f2nu	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:21:55.722
cmb6hkck70043czd42rwz42ub	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:21:55.735
cmb6hkzow0045czd4sd07lptu	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:22:25.712
cmb6hkzoy0047czd41ifzemy0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:22:25.715
cmb6hljo50049czd46wykcxph	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:22:51.605
cmb6hljoh004bczd4evzdfn3n	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:22:51.618
cmb6hlmu7004dczd40a3pydrz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:22:55.712
cmb6hlmuk004fczd4fnpzr6tv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:22:55.724
cmb6hm9zs004hczd4mmagji2v	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:23:25.72
cmb6hma04004jczd4i5n6i2k8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:23:25.733
cmb6hmtze004lczd4v66h4uwd	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:23:51.627
cmb6hmtzi004nczd4iqtqtedl	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:23:51.63
cmb6hmx4u004pczd41vy1e9s7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:23:55.711
cmb6hmx4x004rczd43pu6w6ef	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:23:55.714
cmb6hnkaj004tczd4e0f2b3ne	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:24:25.723
cmb6hnkaw004vczd4iyjur0mk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:24:25.736
cmb6ho49j004xczd4motvg07z	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:24:51.607
cmb6ho49n004zczd4kl7oispc	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:24:51.611
cmb6ho7fm0051czd4ypq3x0u4	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:24:55.714
cmb6ho7fo0053czd43tvgi1mk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:24:55.717
cmb6hould0055czd44m01f65f	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:25:25.729
cmb6houlq0057czd4kl3aii7r	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:25:25.742
cmb6hpeo60059czd4fm0yg5xx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:25:51.75
cmb6hpeoa005bczd4pboftyy1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:25:51.754
cmb6hphpz005dczd4svfxuixe	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:25:55.704
cmb6hphqc005fczd4nmwc8sts	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:25:55.717
cmb6hq515005hczd44a030dhe	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:26:25.913
cmb6hq51l005jczd466qn14uw	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:26:25.93
cmb6hqpco005lczd4m2tnvjv5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:26:52.248
cmb6hqpcy005nczd4crksi3en	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:26:52.258
cmb6hqs0z005pczd4j72zdpnr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:26:55.716
cmb6hqs1d005rczd4hwy8q2uu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:26:55.729
cmb6hrfbf005tczd48l1yc9yy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:27:25.899
cmb6hrfc1005vczd46x5jhi9u	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:27:25.921
cmb6hrzbh005xczd4pt59jsy8	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:27:51.821
cmb6hrzbo005zczd4e8gn8wio	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:27:51.828
cmb6hs2bo0061czd4vbh1hrlk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:27:55.717
cmb6hs2c30063czd43lst3d4j	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:27:55.731
cmb6hspie0065czd4zak2jo7z	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:28:25.766
cmb6hspiz0067czd4phsc9jcp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:28:25.787
cmb6ht9kx0069czd4l0xmkoxn	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:28:51.777
cmb6ht9l4006bczd4qqbcfj3f	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:28:51.784
cmb6htcn5006dczd4mdvd1cac	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:28:55.745
cmb6htcno006fczd4n82s7sju	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:28:55.765
cmb6htzs3006hczd4fi2d7bt7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:29:25.731
cmb6htzsa006jczd4pq3qrljm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:29:25.739
cmb6hujwz006lczd4jlmctibl	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:29:51.827
cmb6hujxi006nczd4sxwvtcfr	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:29:51.846
cmb6hun2y006pczd4rheq7jrl	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:29:55.93
cmb6hun3y006rczd4isanfbe7	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:29:55.966
cmb6hva35006tczd4re8rbic2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:30:25.745
cmb6hva3k006vczd4n7tul4nk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:30:25.761
cmb6hvu5b006xczd4vup7pkjt	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:30:51.743
cmb6hvu5s006zczd4bpz82jh1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:30:51.76
cmb6hvx9z0071czd43egr5iz4	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:30:55.799
cmb6hvxak0073czd4y5d6rqpb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:30:55.821
cmb6hwkfs0075czd407xj7pn5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:31:25.817
cmb6hwkg70077czd44t42qonk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:31:25.831
cmb6hx4cf0079czd4t2vifujh	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:31:51.615
cmb6hx4cl007bczd4xfawrgil	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:31:51.622
cmb6hx7ib007dczd4m586emls	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:31:55.715
cmb6hx7ie007fczd4yd9hb6k6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:31:55.718
cmb6hxuo3007hczd4jhzx9py0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:32:25.732
cmb6hxuo6007jczd4kbcogp8x	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:32:25.735
cmb6hy61e007lczd4zd6l4xdc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:32:40.467
cmb6hy628007nczd49rd8vt8p	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:32:40.496
cmb6hyeu0007pczd4vi4nlvxv	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:32:51.865
cmb6hyeug007rczd42n9a3nnj	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:32:51.881
cmb6hzjsc007tczd4u732mbmd	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:33:44.94
cmb6hzjsu007vczd4yiokew8t	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:33:44.958
cmb6hzoz2007xczd4is835u4w	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:33:51.662
cmb6hzoz7007zczd4cnto09jc	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:33:51.667
cmb6i06pn0081czd43l0qqm9c	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:34:14.651
cmb6i06q60083czd4q5exc4lo	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:34:14.67
cmb6i0tv50085czd44x8en6zf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:34:44.657
cmb6i0tw80087czd434ouj5n6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:34:44.696
cmb6i0z880089czd4d4gcj1yx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:34:51.609
cmb6i0z8b008bczd4uxze9f42	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:34:51.612
cmb6i1h0j008dczd47eh3bouy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:35:14.66
cmb6i1h0m008fczd4xxpcxqw6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:35:14.662
cmb6i245s008hczd4ch8a08if	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:35:44.656
cmb6i246v008jczd4oc2ixhrp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:35:44.695
cmb6i29ix008lczd48p5y0qi4	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:35:51.609
cmb6i29iz008nczd4llquvir8	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:35:51.612
cmb6i2rbb008pczd4vm772p9g	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:36:14.663
cmb6i2rcd008rczd433gd5w5v	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:36:14.702
cmb6i3egl008tczd4xkv0v3cv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:36:44.661
cmb6i3ego008vczd4nx4mli9w	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:36:44.664
cmb6i3jtp008xczd4oh4g916l	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:36:51.614
cmb6i3jts008zczd4wv2js9fa	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:36:51.616
cmb6i41mu0091czd4ofow0rsk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:37:14.695
cmb6i41nx0093czd4w5i2pzow	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:37:14.734
cmb6i4pbe0095czd424zzvpcz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:37:45.386
cmb6i4pc30097czd4rrvkqv4g	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:37:45.412
cmb6i4u670099czd43tadct2h	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:37:51.68
cmb6i4u6s009bczd4fcnyyz6m	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:37:51.7
cmb6i5cb4009dczd4cftbjadq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:38:15.184
cmb6i5cby009fczd4linc7bp1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:38:15.214
cmb6i5z35009hczd427kkuaiy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:38:44.705
cmb6i5z3a009jczd4fafmwdqs	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:38:44.711
cmb6i64fj009lczd4sxv8xcb8	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:38:51.631
cmb6i64fy009nczd46ff3nbn6	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:38:51.647
cmb6i6m9b009pczd4et1ydvr6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:39:14.735
cmb6i6m9j009rczd4v4dam6aq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:39:14.744
cmb6i79dc009tczd4xeo1ylel	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:39:44.688
cmb6i79ei009vczd4mzjadvg6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:39:44.73
cmb6i7esd009xczd4al2pfbac	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:39:51.709
cmb6i7et0009zczd4y8kutfnt	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:39:51.732
cmb6i7wi000a1czd4jrhwhujx	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:40:14.664
cmb6i7wj300a3czd46jhu0cc0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:40:14.703
cmb6i8jn500a5czd4rjb8hti5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:40:44.658
cmb6i8jo800a7czd4w0xz86te	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:40:44.696
cmb6i8p0a00a9czd4supmtdzv	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:40:51.61
cmb6i8p0d00abczd43q9f3l75	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:40:51.613
cmb6i96vw00adczd4imjloeez	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:41:14.781
cmb6i96x100afczd4jb852ioa	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:41:14.821
cmb6i9txo00ahczd4nylzj42a	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:41:44.652
cmb6i9tyr00ajczd4vjzveeiu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:41:44.691
cmb6i9zb800alczd42pkz64ui	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:41:51.621
cmb6i9zbd00anczd4chevscwb	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:41:51.626
cmb6ia91900apczd4ks0sixfc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:42:04.221
cmb6ia94a00arczd4dfp6jf6a	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:42:04.33
cmb6ib9p200atczd48j6sbldd	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:42:51.734
cmb6ib9p600avczd4u1groijc	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:42:51.739
cmb6ibrcx00axczd40a3m38ym	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:43:14.626
cmb6ibrdc00azczd460o1egtp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:43:14.641
cmb6iceey00b1czd4aai80did	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:43:44.507
cmb6icefb00b3czd4zcaiqet8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:43:44.52
cmb6icjw500b5czd446lbj99u	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:43:51.605
cmb6icjw800b7czd4d1c3ix7a	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:43:51.608
cmb6id1jz00b9czd4xxbe4ioh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:44:14.496
cmb6id1kd00bbczd43kc4p6os	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:44:14.509
cmb6idosh00bdczd49e8iusxt	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:44:44.61
cmb6idosv00bfczd4m8ap98gz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:44:44.624
cmb6idu6m00bhczd45fb5fsg1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:44:51.599
cmb6idu6q00bjczd4gwls4bp6	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:44:51.602
cmb6iebuy00blczd48o5a1u2v	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:45:14.506
cmb6iebw000bnczd4zux8xwxy	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:45:14.545
cmb6iez0100bpczd48k9hcp2y	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:45:44.498
cmb6iez0j00brczd4mfn34j0i	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:45:44.515
cmb6if4hk00btczd45ogmbwn0	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:45:51.609
cmb6if4ho00bvczd4rlz4mwgj	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:45:51.612
cmb6ifm5m00bxczd4khet0imv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:46:14.507
cmb6ifm6q00bzczd4skhwxyyo	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:46:14.546
cmb6ig9bl00c1czd46ju3t6ji	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:46:44.529
cmb6ig9c300c3czd4kk379ceh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:46:44.548
cmb6igexp00c5czd40u7t34ic	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:46:51.805
cmb6igeyh00c7czd4ktkxfpgv	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:46:51.833
cmb6igwg600c9czd4h8jnt3pw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:47:14.503
cmb6igwgc00cbczd44qdqcnru	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:47:14.508
cmb6ihjlx00cdczd42pg9lx5d	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:47:44.518
cmb6ihjma00cfczd4aw68xp46	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:47:44.531
cmb6ihp2m00chczd4m6rje2oq	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:47:51.598
cmb6ihp2p00cjczd4ouls7q93	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:47:51.601
cmb6ii6qu00clczd434ff08nu	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:48:14.502
cmb6ii6r600cnczd4t74fwo9o	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:48:14.515
cmb6iitys00cpczd4eivvvcj8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:48:44.596
cmb6iitz600crczd4gtpqt470	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:48:44.61
cmb6iizda00ctczd4ejgqs1pz	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:48:51.599
cmb6iizde00cvczd4amvo722y	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:48:51.602
cmb6ijh1k00cxczd4hhb9o45d	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:49:14.505
cmb6ijh1w00czczd4oksn0zqq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:49:14.517
cmb6ijmr700d3czd4adba3erp	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.002	\N	\N	cmb6ijmr300d1czd47rmr2mme	\N	{"bidId": "cmb6ijmr300d1czd47rmr2mme", "eventType": "BID_PLACED"}	2025-05-27 12:49:21.908
cmb6ik49900d5czd4wynzd09f	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:49:44.589
cmb6ik49n00d7czd4o8x9aavr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:49:44.603
cmb6ik9o900d9czd41l9xnc7b	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:49:51.61
cmb6ik9od00dbczd4wav2fu6m	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:49:51.614
cmb6ikrc300ddczd4hjruiu44	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:50:14.5
cmb6ikrc700dfczd4kwcanxee	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:50:14.504
cmb6ilehp00dhczd4ixz2wlbr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:50:44.509
cmb6ilei200djczd49icx4tgr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:50:44.522
cmb6iljz500dlczd4ec69ss9m	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:50:51.618
cmb6iljz800dnczd4p45zprme	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:50:51.621
cmb6im1nk00dpczd4v47dij7j	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:51:14.529
cmb6im1no00drczd4tmrd43gk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:51:14.533
cmb6imosk00dtczd46kfyeqrf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:51:44.517
cmb6imosx00dvczd4hmw89az4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:51:44.53
cmb6imuak00dxczd4ac2xk0m3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:51:51.645
cmb6imub000dzczd418r07lg5	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:51:51.66
cmb6ind3y00e1czd4of684lz3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:52:16.03
cmb6ind4h00e3czd4w3t54d92	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:52:16.05
cmb6inzi700e5czd4wjyq16or	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:52:45.055
cmb6inziv00e7czd4afv5izc2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:52:45.079
cmb6io4nb00e9czd400564fr9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:52:51.719
cmb6io4nf00ebczd4aekozx94	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:52:51.724
cmb6iom8a00edczd42m5m9j5c	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:53:14.507
cmb6iom8o00efczd4hgtdomzu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:53:14.521
cmb6ip9dq00ehczd4k6o9bxog	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:53:44.51
cmb6ip9du00ejczd4keuetzew	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:53:44.514
cmb6ipevh00elczd4ghr8wtkj	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:53:51.629
cmb6ipevk00enczd49eomqel1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:53:51.633
cmb6iqk8k00etczd4zy6i0i5x	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:54:45.236
cmb6isaz900f9czd4ckj1pocb	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:56:06.549
cmb6isb0c00fbczd4y6oe4fc3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:56:06.589
cmb6it58z00fnczd4l2xf15ua	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.001	0.002	-50	cmb6it58s00flczd45k58mra2	\N	{"bidId": "cmb6it58s00flczd45k58mra2", "eventType": "BID_PLACED"}	2025-05-27 12:56:45.779
cmb6iv20700g5czd42x946hg0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:58:14.887
cmb6iv20t00g7czd4soltdtwe	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:58:14.909
cmb6ivovh00g9czd4a2zbxc23	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:58:44.525
cmb6ivovu00gbczd40gmokzdi	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:58:44.539
cmb6ivucr00gdczd47c2llxds	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:58:51.627
cmb6ivud600gfczd426ieswd8	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:58:51.642
cmb6iwc0e00ghczd4yn7z8thr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 12:59:14.511
cmb6iwc0r00gjczd4p0e7688a	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 12:59:14.523
cmb6iyxxy00h7czd4ajk44nxt	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:01:16.246
cmb6izjqx00h9czd4qtqa00rg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:01:44.505
cmb6izjrb00hbczd40bfdudfj	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:01:44.519
cmb6izp8e00hdczd4fofsc2no	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:01:51.614
cmb6izp8i00hfczd47t0mi80a	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:01:51.618
cmb6j072600hhczd4rdunopxz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:02:14.719
cmb6j072o00hjczd408xlet37	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:02:14.736
cmb6j0uui00hlczd4n1011eqv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:02:45.546
cmb6j0uv300hnczd4lcrz78em	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:02:45.567
cmb6j0ztr00hpczd46wdzsqnl	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:02:51.999
cmb6j0zuo00hrczd4p50z2qsy	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:02:52.032
cmb6j1h7400htczd4ff3d847b	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:03:14.512
cmb6j1h7800hvczd4uf9csvei	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:03:14.516
cmb6j24uq00hxczd48bxu0kua	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:03:45.17
cmb6j24vi00hzczd4suojexur	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:03:45.199
cmb6j29wq00i1czd40zb0f370	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:03:51.722
cmb6j29xl00i3czd4yzlmci7a	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:03:51.754
cmb6j2rhi00i5czd4ta58tuoz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:04:14.502
cmb6j2rhv00i7czd4152a552n	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:04:14.516
cmb6j3en100i9czd4teggy3hl	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:04:44.51
cmb6j3en500ibczd4jsr2fgao	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:04:44.514
cmb6j3k4900idczd4nmyjqxx2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:04:51.61
cmb6j3k4n00ifczd4or6qp63d	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:04:51.624
cmb6j41s700ihczd4ix79xd10	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:05:14.503
cmb6j41sl00ijczd43sjxix8z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:05:14.517
cmb6j4p6800ilczd444tuv0rk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:05:44.817
cmb6j4p6p00inczd4myem5m6q	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:05:44.833
cmb6j4uhb00ipczd45c1mnwts	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:05:51.695
cmb6j4uhp00irczd4w8esbmv4	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:05:51.709
cmb6j5cjp00itczd4p7odxv7a	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:06:15.11
cmb6j5cl200ivczd4sjxk2img	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:06:15.158
cmb6j5z8000ixczd4oajsr8c8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:06:44.497
cmb6j5z8d00izczd4g28ktdfr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:06:44.51
cmb6j64pv00j1czd4nu3ec9pw	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:06:51.619
cmb6j64pz00j3czd4zvvjysrs	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:06:51.623
cmb6j6mtx00j5czd4vgzm4cpb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:07:15.093
cmb6j6mup00j7czd4ixquu1xp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:07:15.121
cmb6j79jv00j9czd4eozt36u7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:07:44.539
cmb6j79kb00jbczd4r7ucknt8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:07:44.556
cmb6j7f2000jdczd4buwgadf1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:07:51.672
cmb6j7f2600jfczd4tj1xlmda	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:07:51.679
cmb6j7wob00jhczd4kqunhw41	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:08:14.508
cmb6j7woh00jjczd45k6xdmrt	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:08:14.513
cmb6j8jtt00jlczd48u241xj3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:08:44.514
cmb6j8ju700jnczd4hb0p73cc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:08:44.528
cmb6j8pg600jpczd4h0exaxir	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:08:51.799
cmb6j8pgc00jrczd4aarios5x	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:08:51.804
cmb6j971d00jtczd4xo40y3y3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:09:14.593
cmb6j971n00jvczd4qsiti3i2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:09:14.604
cmb6j9u5f00jxczd4yphv51vk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:09:44.547
cmb6j9u5o00jzczd46djsxt6h	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:09:44.557
cmb6j9zly00k1czd4hjsbg1ad	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:09:51.622
cmb6j9zm300k3czd4420rzzj6	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:09:51.627
cmb6jahcb00k5czd4uby3a04g	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:10:14.603
cmb6jahcv00k7czd4w7mpfve5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:10:14.623
cmb6jb8n100k9czd4p9r7vv6x	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:10:49.981
cmb6jb8nc00kbczd4bvd9yt97	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:10:49.992
cmb6jba0m00kdczd4l73y73pg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:10:51.766
cmb6jba0u00kfczd462hf9j6e	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:10:51.775
cmb6jbow100kjczd470elzaew	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.002	0.001	100	cmb6jbosz00khczd4m91j365d	\N	{"bidId": "cmb6jbosz00khczd4m91j365d", "eventType": "BID_PLACED"}	2025-05-27 13:11:11.041
cmb6jbrm200klczd4xv5uugqr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:11:14.571
cmb6jbrmi00knczd4bzadpvra	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:11:14.587
cmb6jcg9v00kpczd4gg1hfsas	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:11:46.531
cmb6jcgbi00krczd4kptxfh9i	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:11:46.59
cmb6jcl1m00ktczd47m7n3pgy	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:11:52.714
cmb6jcl2c00kvczd4zznoz3pg	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:11:52.741
cmb6jcwkl00kzczd458y8z7ak	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.0025	0.002	25	cmb6jcwke00kxczd4jr036sp5	\N	{"bidId": "cmb6jcwke00kxczd4jr036sp5", "eventType": "BID_PLACED"}	2025-05-27 13:12:07.653
cmb6jd1wm00l1czd4fwtnbh1l	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:12:14.566
cmb6jd1x200l3czd4uvvw4yre	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:12:14.583
cmb6jdp1t00l5czd4it1y9dt3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:12:44.562
cmb6jdp2c00l7czd4tq2jutjr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:12:44.581
cmb6jdw4g00l9czd4rkeaj76h	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:12:53.728
cmb6jdw6000lbczd4977hqdtx	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:12:53.785
cmb6jec6500ldczd4i2k99yn1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:13:14.525
cmb6jec6j00lfczd41ml1s70l	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:13:14.539
cmb6jezgb00lhczd4zptgbsv9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:13:44.699
cmb6jezh700ljczd43xh688yv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:13:44.731
cmb6jf4th00llczd4edik9zca	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:13:51.654
cmb6jf4tn00lnczd45vzi3tw7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:13:51.66
cmb6jfr6r00lpczd4rsfnkgx5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:14:20.643
cmb6jfr7i00lrczd439ne6blb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:14:20.67
cmb6jgh0k00ltczd4k5hs3y2i	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:14:54.117
cmb6jgh1200lvczd47agx07ge	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:14:54.134
cmb6jgx4o00lxczd4oeqsfdds	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:15:15
cmb6jgx5c00lzczd4hm7grp25	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:15:15.024
cmb6jhjx600m1czd4v5okgkw0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:15:44.538
cmb6jhjxe00m3czd4rl195k2n	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:15:44.546
cmb6jhpkw00m5czd4wzmiaca5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:15:51.873
cmb6jhpl500m7czd4gmih95so	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:15:51.879
cmb6ji7o000m9czd4pr7se26b	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:16:15.312
cmb6ji7or00mbczd4hdiblhoo	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:16:15.339
cmb6ji8qb00mfczd4tlbhb83u	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.004	0.0025	60	cmb6ji8q100mdczd4qyjtwk50	\N	{"bidId": "cmb6ji8q100mdczd4qyjtwk50", "eventType": "BID_PLACED"}	2025-05-27 13:16:16.691
cmb6jiv0y00mhczd4d3yzl0xx	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:16:45.586
cmb6jiv1t00mjczd4mvjc9pef	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:16:45.618
cmb6jj00s00mlczd4e1rwy3zg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:16:52.06
cmb6jj01200mnczd45o5z28t7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:16:52.07
cmb6jjhhb00mpczd4udg1kb6v	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:17:14.687
cmb6jjhhq00mrczd474qz9fom	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:17:14.703
cmb6jkeb400mtczd45e28pvvv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:17:57.233
cmb6jkeed00mvczd49sw1t6as	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:17:57.349
cmb6jkh4k00mxczd4gnkxezsi	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:18:00.884
cmb6jkh7400mzczd4rmella01	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:18:00.976
cmb6jkruw00n1czd4qg6odel3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:18:14.792
cmb6jkrw300n3czd4z378xws1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:18:14.835
cmb6jlf9l00n5czd4ptvgsdah	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:18:45.129
cmb6jlfae00n7czd4d8lp8gu4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:18:45.158
cmb6jlkf600n9czd4cc0182na	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:18:51.811
cmb6jlkg500nbczd44stqah8j	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:18:51.845
cmb6jm1ya00ndczd42f9dxfwr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:19:14.53
cmb6jm1yg00nfczd4mtkd6nqp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:19:14.536
cmb6jmp4h00nhczd4c2hykc8h	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:19:44.561
cmb6jmp5900njczd4lbebvezp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:19:44.589
cmb6jmunh00nlczd4zt9s1s33	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:19:51.725
cmb6jmuo500nnczd4hthwc6nm	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:19:51.749
cmb6jncap00npczd4g1kl0si6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:20:14.593
cmb6jncc200nrczd4unlww09e	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:20:14.642
cmb6jnrwh00ntczd42g6yquq8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:20:34.817
cmb6jnry200nvczd4hw746y9b	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:20:34.874
cmb6jo52600nxczd4tx0aabqy	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:20:51.87
cmb6jo52m00nzczd4qyvn20ym	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:20:51.886
cmb6jotv700o1czd41a7ivye3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:21:24.019
cmb6jotvn00o3czd4rresmcgm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:21:24.035
cmb6jpfbl00o5czd4ptftjix2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:21:51.826
cmb6jpfc200o7czd4t8hw3kc3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:21:51.843
cmb6jpg5y00o9czd406g3ob24	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:21:52.918
cmb6jpg6d00obczd4jfdip6hs	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:21:52.933
cmb6jq3aw00odczd4q0wvuxta	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:22:22.904
cmb6jq3ba00ofczd43yc3ffll	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:22:22.918
cmb6jqpga00ohczd453zird0c	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:22:51.611
cmb6jqpge00ojczd4ce14w1nt	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:22:51.614
cmb6jqqg000olczd451nhxi88	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:22:52.896
cmb6jqqg300onczd4yh7mhppb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:22:52.899
cmb6jrdlg00opczd4e79wk5z7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:23:22.9
cmb6jrdlw00orczd4bhamdn1j	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:23:22.916
cmb6js0kk00otczd48n4jhlyl	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:23:52.676
cmb6js0lf00ovczd4lbyon9jn	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:23:52.707
cmb6js0s800oxczd42zox05nk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:23:52.953
cmb6js0sn00ozczd4ksni52c4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:23:52.967
cmb6jsnw000p1czd4p2xrzhau	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:24:22.896
cmb6jsnwe00p3czd4axkyom3x	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:24:22.91
cmb6jtaen00p5czd48qwphta5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:24:52.079
cmb6jtaf500p7czd4bbd5u9vn	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:24:52.098
cmb6jtb2700p9czd4pqnd649o	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:24:52.927
cmb6jtb2o00pbczd4iucn24t0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:24:52.944
cmb6jtyba00pdczd48v1ksa4x	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:25:23.062
cmb6jtybx00pfczd4smi6ekl0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:25:23.085
cmb6jukhq00phczd4odwvbczs	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:25:51.806
cmb6jukhy00pjczd4jvtf10bu	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:25:51.814
cmb6julbt00plczd4qw70130y	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:25:52.889
cmb6julc800pnczd4ax1yuq00	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:25:52.905
cmb6jv8xf00ppczd46gccz3k3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:26:23.475
cmb6jv8xx00prczd4ldm9bruq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:26:23.493
cmb6jvunc00ptczd4m2ckgczx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:26:51.624
cmb6jvunq00pvczd4u76zr8oj	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:26:51.638
cmb6jvvno00pxczd4w6q5htvj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:26:52.933
cmb6jvvo300pzczd45fvbkpe0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:26:52.948
cmb6jwisu00q1czd4id8fmkvw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:27:22.926
cmb6jwisz00q3czd49a5zog89	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:27:22.931
cmb6jx24200q5czd4zhd6qlga	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:27:47.954
cmb6jx26300q7czd4s4y92ebd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:27:48.027
cmb6jx60700q9czd4l0e93ez2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:27:52.967
cmb6jx61800qbczd4chbh95d9	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:27:53.036
cmb6jxygm00qdczd4b4k29ivt	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:28:29.879
cmb6jxyh200qfczd4m0zmi9va	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:28:29.894
cmb6jyfcq00qhczd403q4cifc	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:28:51.77
cmb6jyfcz00qjczd4zss5592m	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:28:51.779
cmb6jylja00qlczd4z3rgeoxb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:28:59.782
cmb6jyljp00qnczd4301n5vw8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:28:59.797
cmb6jz9zl00qrczd4uhlxv5tw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:29:31.473
cmb6jza0700qtczd4ka8o2mln	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:29:31.495
cmb6jzmyu00qvczd4h3c8jl47	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:29:48.294
cmb6jzmz100qxczd47sqvb04w	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:29:48.301
cmb6jzpiw00qzczd4rlireacg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:29:51.608
cmb6jzpj400r1czd4v8nmhppi	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:29:51.616
cmb6k0a2f00r3czd440illvwy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:30:18.232
cmb6k0a2l00r5czd443kiluzj	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:30:18.238
cmb6k0x7i00r7czd43nypo47p	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:30:48.222
cmb6k0x7m00r9czd4sjgu7eny	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:30:48.226
cmb6k0zty00rbczd42e2jk1it	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:30:51.622
cmb6k0zuc00rdczd44rs9vs93	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:30:51.637
cmb6k1kf900rfczd4rkp2ml8k	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:31:18.31
cmb6k1kgd00rhczd4lqdrj8em	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:31:18.349
cmb6k27hq00rjczd4ivejbsez	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:31:48.207
cmb6k27hv00rlczd4gp2v10jp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:31:48.211
cmb6k2a7g00rnczd4n0d4ahbx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:31:51.725
cmb6k2a7w00rpczd4wy37fa9y	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:31:51.741
cmb6k2umz00rrczd4zjop9alb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:32:18.204
cmb6k2und00rtczd4rf53twmt	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:32:18.217
cmb6k3ht900rvczd4d9apnxkb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:32:48.237
cmb6k3htc00rxczd4wztu9cp3	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:32:48.24
cmb6k3key00rzczd4suqre5we	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:32:51.611
cmb6k3kf100s1czd4gt22q8xn	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:32:51.614
cmb6k44yi00s3czd4o0dnsouv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:33:18.234
cmb6k44yy00s5czd4wd5ny2vc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:33:18.25
cmb6k4shd00s7czd4q90xv4vr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:33:48.721
cmb6k4si000s9czd4f80q1voe	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:33:48.744
cmb6k4us300sbczd4xk02rxu7	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:33:51.699
cmb6k4ut500sdczd42xth9qn9	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:33:51.737
cmb6k5f8m00sfczd4yt4e4g74	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:34:18.215
cmb6k5f9100shczd4n4mh4g7y	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:34:18.229
cmb6k62e500sjczd4j97qs80v	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:34:48.221
cmb6k62eb00slczd4b54d0r25	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:34:48.228
cmb6k65pr00snczd4wcrbrh0b	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:34:52.528
cmb6k65q900spczd46r58ej18	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:34:52.545
cmb6k6pix00srczd4v08tqysg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:35:18.202
cmb6k6pj000stczd48arw3mnu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:35:18.205
cmb6k7cof00svczd41zoom48b	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:35:48.207
cmb6k7cph00sxczd4gbmftua9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:35:48.246
cmb6k7fbr00szczd4mqjh38za	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:35:51.639
cmb6k7fbv00t1czd49lbb7vex	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:35:51.643
cmb6k7zto00t3czd48qpw7zlf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:36:18.205
cmb6k7zur00t5czd4wt3xardb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:36:18.243
cmb6k8mz600t7czd48xpl5nsj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:36:48.21
cmb6k8mzj00t9czd4vdhftk14	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:36:48.223
cmb6k8plv00tbczd4a9bpqkud	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:36:51.62
cmb6k8pm100tdczd44lx0zx1c	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:36:51.625
cmb6k9a4f00tfczd4kb393oby	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:37:18.207
cmb6k9a5i00thczd4r1u4dhmc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:37:18.246
cmb6k9x9r00tjczd4tnmn44ay	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:37:48.208
cmb6k9xa400tlczd4mfused62	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:37:48.221
cmb6k9zw800tnczd4s1tkyue3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:37:51.609
cmb6k9zwb00tpczd4no13zzjg	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:37:51.611
cmb6kakfa00trczd48nxzogvh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:38:18.215
cmb6kakfd00ttczd4nwq16vct	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:38:18.218
cmb6kb7m000tvczd4jym69n4u	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:38:48.264
cmb6kb7m900txczd4wfoovq6w	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:38:48.273
cmb6kbagt00tzczd4rkjyq1ft	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:38:51.965
cmb6kbahr00u1czd499ngn736	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:38:51.999
cmb6kburl00u3czd4bfqaplvo	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:39:18.273
cmb6kburw00u5czd4yli0hevd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:39:18.284
cmb6kchw900u7czd4evejh6pz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:39:48.249
cmb6kchwf00u9czd4tafsyxun	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:39:48.255
cmb6kckkq00ubczd42yvdlogy	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:39:51.722
cmb6kckkv00udczd48vh2ir8l	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:39:51.727
cmb6kd50y00ufczd4fbgi66uu	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:40:18.227
cmb6kd51e00uhczd4l121oper	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:40:18.242
cmb6kdshm00ujczd4ezc4xzeq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:40:48.634
cmb6kdsi400ulczd4706mx3mp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:40:48.653
cmb6kdusu00unczd4ajc8xazz	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:40:51.631
cmb6kdut900upczd4sou8bulo	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:40:51.646
cmb6kefbt00urczd40djas4ba	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:41:18.234
cmb6kefcc00utczd4syhhr7iz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:41:18.252
cmb6kf4wx00uvczd4kcy3mfd6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:41:51.393
cmb6kf4xx00uxczd4520pxfxx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:41:51.429
cmb6kf5b600uzczd4hmdaaeg5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:41:51.906
cmb6kf5bt00v1czd45m7g2jnt	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:41:51.929
cmb6kfpno00v3czd4a7sza6f0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:42:18.277
cmb6kfpo300v5czd4uddr8zza	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:42:18.291
cmb6kgcrn00v7czd4p9kcawtx	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:42:48.227
cmb6kgcs200v9czd4vbn2spke	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:42:48.242
cmb6kgfqg00vbczd4ls5do3ub	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:42:52.072
cmb6kgfqw00vdczd4xgbuksm6	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:42:52.088
cmb6kgzwf00vfczd45fkimbe6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:43:18.207
cmb6kgzxi00vhczd4rib92u80	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:43:18.247
cmb6khn1l00vjczd4gwy1z4r2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:43:48.201
cmb6khn1o00vlczd4smz4yzy5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:43:48.205
cmb6khppv00vnczd4pgnjux13	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:43:51.668
cmb6khpqz00vpczd41lszsrkg	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:43:51.707
cmb6kiafc00vrczd48cdw748t	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:44:18.504
cmb6kiaft00vtczd4l62tygb4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:44:18.521
cmb6kixcs00vvczd4ljtkr94b	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:44:48.221
cmb6kixcz00vxczd4idbgpm26	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:44:48.227
cmb6kj00100vzczd40zwrmdgm	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:44:51.649
cmb6kj00h00w1czd4rq5ei3kt	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:44:51.666
cmb6kjkhx00w3czd4k9tn3d7g	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:45:18.214
cmb6kjki300w5czd4sbr8esbq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:45:18.219
cmb6kk7ni00w7czd4ohwio93w	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:45:48.223
cmb6kk7ol00w9czd4ou2hvrnc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:45:48.262
cmb6kkafa00wbczd4kdx2f4th	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:45:51.814
cmb6kkafs00wdczd4pym2j59k	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:45:51.833
cmb6kkusi00wfczd4sngegp0e	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:46:18.21
cmb6kkutl00whczd4fzuig4ea	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:46:18.249
cmb6klhxv00wjczd4ei22cl9q	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:46:48.212
cmb6klhyy00wlczd4f0h76ev0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:46:48.25
cmb6klkkh00wnczd4brp4qlh4	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:46:51.617
cmb6klkks00wpczd4czwz8ydt	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:46:51.629
cmb6km53800wrczd4123tanvh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:47:18.213
cmb6km54d00wtczd4w7ilkpz1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:47:18.253
cmb6kms8k00wvczd464f9whqn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:47:48.212
cmb6kms8u00wxczd4vv23eatb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:47:48.223
cmb6kmuv500wzczd415n69ei5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:47:51.617
cmb6kmuv800x1czd4wxlkjd1z	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:47:51.62
cmb6knfe300x3czd4mdf8jx7h	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:48:18.22
cmb6knff500x5czd44x59jkct	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:48:18.258
cmb6ko2m700x7czd4x8bbpc68	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:48:48.319
cmb6ko2mb00x9czd42qr5gkam	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:48:48.324
cmb6ko55i00xbczd4kx77ph6o	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:48:51.606
cmb6ko55o00xdczd49hp2df7g	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:48:51.612
cmb6kopot00xfczd4gy764bpx	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:49:18.222
cmb6kopoz00xhczd42uix49s2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:49:18.227
cmb6krj2s00xjczd419x2yuy5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:51:29.62
cmb6krj2t00xlczd46itf5x56	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:51:29.622
cmb6krj3a00xnczd4kwasmv5q	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:51:29.638
cmb6krj3b00xpczd4dnjdqp7m	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:51:29.639
cmb6krjan00xrczd4q83f3egc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:51:29.903
cmb6krjat00xtczd48dvysjin	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:51:29.91
cmb6kt1kq0001cz3emtdi9s3j	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:52:40.251
cmb6kt1kz0003cz3ez0iha5p4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:52:40.26
cmb6kt7ph0005cz3eup5uk8s1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:52:48.198
cmb6kt7qa0007cz3eaovhd08c	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:52:48.226
cmb6ktac20009cz3efmofsj8m	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:52:51.602
cmb6ktacg000bcz3ega7kutxd	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:52:51.617
cmb6ktuv6000dcz3es589majd	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:53:18.21
cmb6ktuvb000fcz3edlos0qef	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:53:18.215
cmb6kui8s000hcz3e2qz6t2il	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:53:48.508
cmb6kui9f000jcz3e3oprykh9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:53:48.531
cmb6kukoj000lcz3e40frcdmg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:53:51.667
cmb6kukp0000ncz3ex8hhv5by	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:53:51.684
cmb6kv5az000pcz3eux82h8mh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:54:18.396
cmb6kv5c8000rcz3e5od01r1q	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:54:18.44
cmb6kvsgj000tcz3eecm4xgdo	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:54:48.403
cmb6kvsgy000vcz3ebwor2z9j	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:54:48.418
cmb6kvv8q000xcz3e68y29uy8	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:54:52.01
cmb6kvv98000zcz3eokkuisk0	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:54:52.029
cmb6kwfgh0011cz3e0by8n423	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:55:18.21
cmb6kwfgm0013cz3e1iri71bi	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:55:18.214
cmb6kx2lz0015cz3e9rt2hk0r	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:55:48.216
cmb6kx2md0017cz3e96r9nf8t	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:55:48.23
cmb6kx5i10019cz3eirrw49y7	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:55:51.962
cmb6kx5i7001bcz3ebp2x66qo	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:55:51.967
cmb6kxpqp001dcz3eomjq3zqo	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:56:18.193
cmb6kxpr2001fcz3etj67glhb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:56:18.207
cmb6kycvz001hcz3eqrn160us	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:56:48.192
cmb6kycw2001jcz3em1s3dp0z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:56:48.195
cmb6kyfih001lcz3efm2zw24h	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:56:51.594
cmb6kyfis001ncz3emutl4i4x	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:56:51.604
cmb6kz018001pcz3ety8n1xvc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:57:18.189
cmb6kz01l001rcz3e6fxesnwm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:57:18.201
cmb6kzn6u001tcz3eydyg48ki	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:57:48.199
cmb6kzn6y001vcz3em29ohwsl	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:57:48.202
cmb6kzptd001xcz3el5nq7rpq	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:57:51.601
cmb6kzptg001zcz3egsngrqwx	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:57:51.604
cmb6l0ac50021cz3eqkrxambb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:58:18.197
cmb6l0ach0023cz3eu2a48ssn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:58:18.209
cmb6l0xhd0025cz3enys578t0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:58:48.194
cmb6l0xhg0027cz3eeturbeoe	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:58:48.197
cmb6l10430029cz3e1o13hvb5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:58:51.604
cmb6l1047002bcz3e9gr4898j	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:58:51.607
cmb6l1kmm002dcz3e1fb4qjjy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:59:18.19
cmb6l1kmz002fcz3euum8t6xz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:59:18.203
cmb6l27s9002hcz3eyqrgkk4w	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:59:48.201
cmb6l27sm002jcz3ecetkbisg	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:59:48.215
cmb6l2aer002lcz3ecbnyvncg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 13:59:51.603
cmb6l2aex002ncz3eh0bxnvcb	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 13:59:51.609
cmb6l2uyx002pcz3ev4noew9q	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:00:18.25
cmb6l2uz6002rcz3ems847gd6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:00:18.259
cmb6l3i30002tcz3ei6kvrzs2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:00:48.205
cmb6l3i34002vcz3enr2vspxa	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:00:48.208
cmb6l3kp6002xcz3e4ptghgps	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:00:51.595
cmb6l3kp9002zcz3ep1zqf26d	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:00:51.598
cmb6l458b0031cz3ep5hev7zc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:01:18.203
cmb6l458e0033cz3ezfhfm8qt	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:01:18.207
cmb6l4sex0035cz3edapffroq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:01:48.249
cmb6l4sfi0037cz3e55jfkfx9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:01:48.27
cmb6l4v2t0039cz3eoyzjmkn8	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:01:51.701
cmb6l4v3c003bcz3epls8g1xc	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:01:51.72
cmb6l5g22003dcz3ecfsjokii	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:02:18.89
cmb6l5g3c003fcz3ejlby0flx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:02:18.936
cmb6l62tu003hcz3eqc3uaqx7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:02:48.402
cmb6l62ug003jcz3ekjj9k4sp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:02:48.424
cmb6l65fs003lcz3e9id9rxxx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:02:51.784
cmb6l65g9003ncz3exu7d27e7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:02:51.801
cmb6l6qi2003pcz3exoiexsnu	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:03:19.082
cmb6l6qir003rcz3eom56mb5c	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:03:19.107
cmb6l7cyq003tcz3eh03w50sv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:03:48.194
cmb6l7czs003vcz3e5q0kr3h3	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:03:48.233
cmb6l7fl7003xcz3e9yh97ssi	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:03:51.596
cmb6l7flb003zcz3exh000ec8	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:03:51.599
cmb6l80490041cz3eyl7wz3lh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:04:18.202
cmb6l804c0043cz3ezpops1vf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:04:18.205
cmb6l8ncm0045cz3eqgc5s42a	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:04:48.311
cmb6l8ncr0047cz3evs4pzxfj	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:04:48.315
cmb6l8pvy0049cz3ej5fmvxid	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:04:51.598
cmb6l8pw1004bcz3eq1ojnlyg	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:04:51.601
cmb6l9d91004dcz3e2dxzdcq6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:05:21.86
cmb6l9d9x004fcz3eyr7g84f8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:05:21.909
cmb6l9gru004hcz3e8fw7kvq9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:05:26.442
cmb6l9gxg004jcz3e10ztqlnw	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:05:26.645
cmb6la0a6004lcz3eaemjkmo7	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:05:51.727
cmb6la0ab004ncz3ejaqvf6vm	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:05:51.732
cmb6lawh2004pcz3ex6c889o2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:06:33.446
cmb6lawhj004rcz3eq896fz1u	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:06:33.463
cmb6lbamy004tcz3efufzv9v5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:06:51.802
cmb6lban4004vcz3en7w0pa3o	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:06:51.809
cmb6lbjhf004xcz3e91fmppx7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:07:03.267
cmb6lbjhi004zcz3e3r9mv4zv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:07:03.271
cmb6lbwas0053cz3ecbibs9sl	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.002	0.004	-50	cmb6lbw7m0051cz3e47xa80l7	\N	{"bidId": "cmb6lbw7m0051cz3e47xa80l7", "eventType": "BID_PLACED"}	2025-05-27 14:07:19.876
cmb6lc6qi0055cz3ee7kens0s	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:07:33.403
cmb6lc6qz0057cz3etcnhoxrd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:07:33.419
cmb6lckvk0059cz3e5yohbpv5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:07:51.729
cmb6lckvz005bcz3etdni06dr	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:07:51.743
cmb6lctrr005dcz3e84okbhnr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:08:03.256
cmb6lctrv005fcz3e44dlk0yt	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:08:03.26
cmb6ldgxc005hcz3evwwvzzw2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:08:33.264
cmb6ldgxp005jcz3er3ahkndf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:08:33.277
cmb6ldv2n005lcz3eueq6ugbj	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:08:51.599
cmb6ldv2q005ncz3ezo63uqbn	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:08:51.602
cmb6le429005pcz3ebmjbrb5j	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:09:03.249
cmb6le42b005rcz3efvppwr6v	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:09:03.252
cmb6ler7k005tcz3eoyhl9v4n	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:09:33.249
cmb6ler8n005vcz3evskc0kpr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:09:33.288
cmb6lf5d8005xcz3ewss0mp7c	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:09:51.597
cmb6lf5db005zcz3e0o6t91vl	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:09:51.6
cmb6lfed30061cz3eh07u4tbo	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:10:03.255
cmb6lfedf0063cz3eu01xn8fb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:10:03.268
cmb6lg1i90065cz3e11iflxck	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:10:33.25
cmb6lg1im0067cz3ei1eczplf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:10:33.262
cmb6lgfo40069cz3emunjd163	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:10:51.605
cmb6lgfo7006bcz3esvnjitex	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:10:51.608
cmb6lgoni006dcz3eb0g4gfyw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:11:03.247
cmb6lgonv006fcz3egiwnp54o	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:11:03.259
cmb6lhf0o006hcz3et4f4oeem	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:11:37.416
cmb6lhf10006jcz3e00l5cg5p	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:11:37.428
cmb6lhq1t006lcz3ekbr4qhge	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:11:51.713
cmb6lhq27006ncz3e6ajgi1r4	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:11:51.728
cmb6lhrs0006rcz3ewucvg8i3	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.001	0.002	-50	cmb6lhrrv006pcz3e0bwnkgbj	\N	{"bidId": "cmb6lhrrv006pcz3e0bwnkgbj", "eventType": "BID_PLACED"}	2025-05-27 14:11:53.952
cmb6lhzax006vcz3etcx94hy6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:12:03.705
cmb6lhzbm006xcz3eisdone9e	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:12:03.73
cmb6li4la006zcz3etvftlrku	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:12:10.558
cmb6li4m10071cz3ewyuritgl	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:12:10.585
cmb6lia4a0075cz3e47189hkv	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.002	0.001	100	cmb6lia440073cz3ejpckhcjd	\N	{"bidId": "cmb6lia440073cz3ejpckhcjd", "eventType": "BID_PLACED"}	2025-05-27 14:12:17.722
cmb6lip9h0077cz3e65586cuw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:12:37.349
cmb6lip9w0079cz3evv6kfmfk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:12:37.364
cmb6lj09j007bcz3eniaumaja	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:12:51.607
cmb6lj09n007dcz3e1hzzd1tg	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:12:51.611
cmb6ljcbx007fcz3eodv7k3gs	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:13:07.245
cmb6ljcca007hcz3ewpnzduub	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:13:07.259
cmb6ljzh7007jcz3e5lnnzmsk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:13:37.243
cmb6ljzha007lcz3elogbcux8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:13:37.246
cmb6lkal8007ncz3ed4ib0cy9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:13:51.645
cmb6lkald007pcz3e2tq3en66	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:13:51.65
cmb6lkmmz007rcz3ei93h7cx0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:14:07.26
cmb6lkmn3007tcz3e3j5vo4h6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:14:07.264
cmb6ll9s5007vcz3eprhzstmt	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:14:37.253
cmb6ll9si007xcz3edcw9lkko	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:14:37.267
cmb6llkvh007zcz3eizz8apdq	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:14:51.629
cmb6llkvv0081cz3eukh1cmur	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:14:51.643
cmb6llwxe0083cz3em0k5o28p	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:15:07.25
cmb6llwxh0085cz3evr3wgvvs	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:15:07.253
cmb6lmk2z0087cz3eh2wamtrv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:15:37.259
cmb6lmk3c0089cz3e188ak2p2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:15:37.272
cmb6lmv62008bcz3e8lebnceg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:15:51.627
cmb6lmv6g008dcz3efmclc39f	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:15:51.641
cmb6ln782008fcz3ei7a0dfs7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:16:07.251
cmb6ln786008hcz3ertke0yn5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:16:07.255
cmb6lnuhb008jcz3e5clghwdv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:16:37.391
cmb6lnuhh008lcz3e68d9up8p	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:16:37.397
cmb6lo5h8008ncz3eb3mkdzrg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:16:51.644
cmb6lo5hn008pcz3e9qd5nc66	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:16:51.66
cmb6lohit008rcz3e0cuxppq8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:17:07.253
cmb6lohj8008tcz3eekq5fyxm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:17:07.268
cmb6lp53h008vcz3e7ycpjfxq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:17:37.806
cmb6lp54t008xcz3ez6wtf0kd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:17:37.853
cmb6lpg11008zcz3eyxey690c	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:17:51.973
cmb6lpg1l0091cz3ezw7lnnak	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:17:51.993
cmb6lpruk0093cz3es3y7g8to	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:18:07.292
cmb6lprv20095cz3evg859vaa	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:18:07.311
cmb6lqf0u0097cz3e4sy46sr5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:18:37.326
cmb6lqf1h0099cz3ey0twzcoc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:18:37.349
cmb6lqq49009bcz3ew5nunp32	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:18:51.705
cmb6lqq4s009dcz3ecia0jc6h	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:18:51.724
cmb6lr2ey009fcz3esinomtsk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:19:07.642
cmb6lr2fq009hcz3ej1igiq9h	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:19:07.67
cmb6lrpq0009jcz3esfej92iq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:19:37.848
cmb6lrpqq009lcz3e7bcqfb45	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:19:37.874
cmb6ls0cm009ncz3ee699zq0h	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:19:51.623
cmb6ls0d2009pcz3eh94vwnlh	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:19:51.638
cmb6lscrl009rcz3ewcl9nznx	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:20:07.714
cmb6lscs6009tcz3egxbfmucz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:20:07.734
cmb6lszmr009vcz3eq0p8mjam	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:20:37.347
cmb6lszo1009xcz3e7q1p0pzh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:20:37.394
cmb6ltaus009zcz3ect2unbfh	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:20:51.892
cmb6ltavy00a1cz3eqoy5wf4j	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:20:51.935
cmb6ltmt500a3cz3eh5e930eb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:21:07.385
cmb6ltmtt00a5cz3elerwnh2r	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:21:07.409
cmb6lua3u00a7cz3e1s2jg5rg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:21:37.579
cmb6lua4o00a9cz3e72rbdbsg	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:21:37.608
cmb6lul1u00abcz3eppw9y561	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:21:51.762
cmb6lul2g00adcz3e1gw345wp	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:21:51.785
cmb6luxi100afcz3epzurgmyj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:22:07.898
cmb6luxio00ahcz3ekefuqvuj	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:22:07.92
cmb6lvk6800ajcz3e9tfj6snd	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:22:37.28
cmb6lvk6f00alcz3effpb7xr6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:22:37.287
cmb6lvve400ancz3enkd1g091	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:22:51.82
cmb6lvvf200apcz3eahls8y2i	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:22:51.854
cmb6lw7ov00arcz3exxurkhqj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:23:07.76
cmb6lw7pq00atcz3eipb53xt2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:23:07.791
cmb6lwui100avcz3eweumk74v	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:23:37.321
cmb6lwuik00axcz3e0utceoz5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:23:37.34
cmb6lx5pi00azcz3ezl2a667b	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:23:51.846
cmb6lx5pt00b1cz3eo4y5ae2r	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:23:51.857
cmb6lxht600b3cz3ehcbitkq6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:24:07.53
cmb6lxhtt00b5cz3eqp5lm7ab	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:24:07.553
cmb6ly4qt00b7cz3er7yqx4yg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:24:37.253
cmb6ly4r700b9cz3e80g4fq83	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:24:37.268
cmb6lyfuc00bbcz3e619e4fhw	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:24:51.637
cmb6lyfuq00bdcz3etdbxwo8e	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:24:51.651
cmb6lysdk00bfcz3ezlellc4u	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:25:07.88
cmb6lysen00bhcz3e4ua2beg6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:25:07.919
cmb6lzf1w00bjcz3edcob2r8t	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:25:37.268
cmb6lzf2300blcz3ezwdxml5q	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:25:37.275
cmb6lzq4j00bncz3er2xq1y8o	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:25:51.619
cmb6lzq4m00bpcz3egivdpd08	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:25:51.623
cmb6m028800brcz3eh4e9ox8b	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:26:07.304
cmb6m028j00btcz3ef3etuf0d	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:26:07.315
cmb6m0pbv00bvcz3et9xwigap	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:26:37.243
cmb6m0pc800bxcz3exesz6dav	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:26:37.257
cmb6m10f500bzcz3ewyrdeyzi	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:26:51.618
cmb6m10f900c1cz3ecsxq4q5d	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:26:51.621
cmb6m1cit00c3cz3ea0wh7i5s	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:27:07.302
cmb6m1cjc00c5cz3e8i95gfck	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:27:07.32
cmb6m1zng00c7cz3ekrbu3n7c	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:27:37.277
cmb6m1znw00c9cz3e9727k0gb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:27:37.292
cmb6m2aq900cbcz3eyhzfdxif	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:27:51.634
cmb6m2ark00cdcz3eqrowk0ec	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:27:51.681
cmb6m2mt200cfcz3eirc38w4q	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:28:07.287
cmb6m2mtk00chcz3ejj6b1sh1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:28:07.305
cmb6m39xb00cjcz3ev9lde21t	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:28:37.248
cmb6m39xe00clcz3e2mm60wpj	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:28:37.251
cmb6m3l0f00cncz3en9w5eao9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:28:51.616
cmb6m3l0i00cpcz3evu4ff98r	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:28:51.618
cmb6m3x2m00crcz3eaovw2ru9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:29:07.246
cmb6m3x3000ctcz3ekwt2yyly	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:29:07.261
cmb6m4k7y00cvcz3erus7dvik	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:29:37.247
cmb6m4k8c00cxcz3e2joihi8d	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:29:37.26
cmb6m4vb700czcz3eiaiy6l9k	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:29:51.619
cmb6m4vba00d1cz3e5et3cikw	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:29:51.622
cmb6m5etq00d3cz3ekzg7w68s	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:30:16.91
cmb6m5euk00d5cz3ecbnwbmv9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:30:16.94
cmb6m5up500d7cz3ewd44shcp	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:30:37.481
cmb6m5upz00d9cz3escdc1jdl	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:30:37.512
cmb6m65qx00dbcz3e9vqpp87d	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:30:51.801
cmb6m65rk00ddcz3ex2ksxfvz	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:30:51.824
cmb6m6i1600dfcz3e3p71j448	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:31:07.722
cmb6m6i1r00dhcz3efn31t5mk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:31:07.743
cmb6m6u850003cz8pku3n6i2n	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.005	0.002	150	cmb6m6tyv0001cz8p0kzscafr	\N	{"bidId": "cmb6m6tyv0001cz8p0kzscafr", "eventType": "BID_PLACED"}	2025-05-27 14:31:23.525
cmb6m757100djcz3e4lry6nvc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:31:37.741
cmb6m757o00dlcz3e7tjco4cb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:31:37.764
cmb6m7g4900dncz3eto54lchb	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:31:51.897
cmb6m7g4f00dpcz3ejq3n396l	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:31:51.904
cmb6m7s9y00drcz3e625n9g2o	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:32:07.654
cmb6m7sbe00dtcz3eiqrpgcvx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:32:07.707
cmb6m8fgp00dvcz3e3zdi92d8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:32:37.705
cmb6m8fh000dxcz3erp0vw2ob	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:32:37.717
cmb6m8qb800dzcz3e837gdi0a	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:32:51.764
cmb6m8qbn00e1cz3e86j4bhrp	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:32:51.779
cmb6m92qh00e3cz3ejmviwscg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:33:07.865
cmb6m92r000e5cz3e8faodn3o	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:33:07.884
cmb6m9i090003cza2ggzcvdcw	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.005	0.005	0	cmb6m9hpo0001cza2skwxprl0	\N	{"bidId": "cmb6m9hpo0001cza2skwxprl0", "eventType": "BID_PLACED"}	2025-05-27 14:33:27.658
cmb6m9ibq0005cza2z0pzu7s0	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.006	0.005	20	cmb6m9hpo0001cza2skwxprl0	\N	{"bidId": "cmb6m9hpo0001cza2skwxprl0", "eventType": "BID_PLACED"}	2025-05-27 14:33:28.07
cmb6m9pjp00e7cz3epq2m3ws3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:33:37.429
cmb6m9pkn00e9cz3ex8nt937v	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:33:37.463
cmb6ma0oo00ebcz3ehmbkbc4j	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:33:51.864
cmb6ma0p500edcz3ekn155n4x	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:33:51.882
cmb6macyz00efcz3eu6ndprxn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:34:07.787
cmb6maczs00ehcz3ed55yx3pq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:34:07.817
cmb6mazqw00ejcz3em8wnc1ea	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:34:37.304
cmb6mazrb00elcz3e1v2opkl2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:34:37.319
cmb6mbb2f00encz3eqlm3sny2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:34:51.975
cmb6mbb3100epcz3ef5hzsohk	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:34:51.997
cmb6mbn6y00ercz3emtx88osi	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:35:07.69
cmb6mbn7s00etcz3egk086mdw	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:35:07.72
cmb6mc39b00excz3e98vg0btd	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.003	0.006	-50	cmb6mc2y900evcz3e16z5lob5	\N	{"bidId": "cmb6mc2y900evcz3e16z5lob5", "eventType": "BID_PLACED"}	2025-05-27 14:35:28.511
cmb6mce4700ezcz3e2dwz4ax0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:35:42.583
cmb6mce5200f1cz3eq93z29jj	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:35:42.614
cmb6mcl9700f3cz3excmaqfov	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:35:51.835
cmb6mcla200f5cz3ebcoteqm3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:35:51.866
cmb6mcxd400f7cz3ehg4whg35	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:36:07.528
cmb6mcxdv00f9cz3e1sfdsvx9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:36:07.555
cmb6mdkfa00fbcz3es69c8zcf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:36:37.414
cmb6mdkfq00fdcz3eypc5kiwp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:36:37.431
cmb6mdvle00ffcz3e672fu44d	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:36:51.89
cmb6mdvly00fhcz3e8rzxk71t	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:36:51.91
cmb6me7kj00fjcz3e681vdmpa	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:37:07.411
cmb6me7l700flcz3etgdjxfdl	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:37:07.435
cmb6mev1d00fncz3ed3aswhjk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:37:37.826
cmb6mev2300fpcz3ebf507b0n	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:37:37.851
cmb6mf5qn00frcz3e8iyom930	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:37:51.696
cmb6mf5r400ftcz3etjn9exqu	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:37:51.713
cmb6mfey600fxcz3ei8imznvr	cmb2xvddo0000czr3i311rrid	BID_PLACED	0.007	0.003	133.3333333333333	cmb6mfexq00fvcz3eucp6why5	\N	{"bidId": "cmb6mfexq00fvcz3eucp6why5", "eventType": "BID_PLACED"}	2025-05-27 14:38:03.63
cmb6mfhrb00fzcz3eevsfr8pv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:38:07.271
cmb6mfhrh00g1cz3e2neallih	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:38:07.278
cmb6mg5it00g3cz3e5bvzo6d3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:38:38.069
cmb6mg5kd00g5cz3ea870xk32	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:38:38.125
cmb6mghas00g7cz3evbb75k3d	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:38:53.332
cmb6mghbk00g9cz3ehtszn99s	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:38:53.36
cmb6mgsj600gbcz3ejflt4d5e	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:39:07.89
cmb6mgsjs00gdcz3e93tmp90t	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:39:07.912
cmb6mhfe700gfcz3emte905qj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:39:37.519
cmb6mhfep00ghcz3eslnls19o	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:39:37.537
cmb6mhqds00gjcz3etz6n31r9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:39:51.76
cmb6mhqee00glcz3epwpcdxon	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:39:51.782
cmb6mi2gh00gncz3eh3jr9omi	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:40:07.409
cmb6mi2h500gpcz3ekaxcd2fd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:40:07.434
cmb6miphj00grcz3en02q0syj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:40:37.255
cmb6mipho00gtcz3e6w3tywef	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:40:37.26
cmb6mj0mi00gvcz3ey194eme5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:40:51.69
cmb6mj0my00gxcz3eu2erjodz	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:40:51.706
cmb6mjcnd00gzcz3errv18788	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:41:07.273
cmb6mjcnu00h1cz3e1gkqk0qp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:41:07.29
cmb6mjzum00h3cz3e2182y2z6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:41:37.342
cmb6mjzv400h5cz3e1ty3ohna	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:41:37.36
cmb6mkaw800h7cz3ewvhep7dt	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:41:51.656
cmb6mkawn00h9cz3eh7xwcf9m	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:41:51.672
cmb6mkmxd00hbcz3ex15igc3y	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:42:07.25
cmb6mkmxj00hdcz3e15eexzgx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:42:07.255
cmb6mla2l00hfcz3e4r4ucge6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:42:37.246
cmb6mla2p00hhcz3eiyamnzxq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:42:37.249
cmb6mll6700hjcz3e2rlbgysi	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:42:51.631
cmb6mll6l00hlcz3e2x0z70hj	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:42:51.646
cmb6mlx8p00hncz3egillz7pt	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:43:07.274
cmb6mlx9400hpcz3e70reur51	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:43:07.288
cmb6mmkd300hrcz3evzxry3ab	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:43:37.239
cmb6mmkd600htcz3e1yp5hqeb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:43:37.243
cmb6mmvge00hvcz3eux83kegi	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:43:51.614
cmb6mmvgh00hxcz3ekqxihvjz	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:43:51.617
cmb6mn7ij00hzcz3ep24mxvfm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:44:07.243
cmb6mn7iv00i1cz3e92qt39k7	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:44:07.256
cmb6mnuoo00i3cz3esv8cp63d	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:44:37.272
cmb6mnup300i5cz3ehaslib46	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:44:37.287
cmb6mo5vi00i7cz3ek353iiir	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:44:51.774
cmb6mo5w900i9cz3e79js1djf	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:44:51.801
cmb6mohw300ibcz3ehsr3hci1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:45:07.347
cmb6mohwb00idcz3es89whyck	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:45:07.355
cmb6mp4yi00ifcz3ebp8myn23	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:45:37.242
cmb6mp4yu00ihcz3e2kvyxl1j	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:45:37.255
cmb6mpg1r00ijcz3ev6an1ubp	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:45:51.615
cmb6mpg1u00ilcz3eb9d37l5h	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:45:51.618
cmb6mps3x00incz3era8az2ic	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:46:07.245
cmb6mps4a00ipcz3ezbjet1kl	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:46:07.259
cmb6mqf9o00ircz3emfopyy6o	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:46:37.261
cmb6mqf9t00itcz3e07avhhmk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:46:37.265
cmb6mqqe400ivcz3et21a3ome	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:46:51.676
cmb6mqqek00ixcz3ezyri0ych	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:46:51.692
cmb6mr2go00izcz3ezvgs29d7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:47:07.32
cmb6mr2h900j1cz3ekb9phyf3	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:47:07.341
cmb6msam600j3cz3eq32g377e	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:48:04.542
cmb6msamk00j5cz3ewwkhv1wu	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:48:04.556
cmb6munsd00j7cz3eusonbxye	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:49:54.926
cmb6munsv00j9cz3erfkarnmz	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:49:54.943
cmb6mvvxh00jbcz3eh6mzgl16	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:50:52.134
cmb6mvvxs00jdcz3eqmg59mnx	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:50:52.145
cmb6mx0bj00jfcz3ef5nz6q06	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:51:44.479
cmb6mx0bw00jhcz3ebou6e94v	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:51:44.493
cmb6mx0jd00jjcz3exxg9v0v4	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:51:44.761
cmb6mx0k500jlcz3e3u02044m	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:51:44.79
cmb6mx6dd00jncz3e5psknpyk	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:51:52.322
cmb6mx6dp00jpcz3e9v3xoefu	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:51:52.333
cmb6my79z00jrcz3eufhdlqae	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:52:40.151
cmb6my7aj00jtcz3eibgskeuw	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:52:40.172
cmb6my7cf00jvcz3e6iyqyeze	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:52:40.24
cmb6my7cm00jxcz3eypr8qeym	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:52:40.246
cmb6myge600jzcz3eqvvyqywt	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:52:51.966
cmb6mygef00k1cz3egp2js4wy	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:52:51.976
cmb6mz86o00k3cz3etdt3ka2p	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:53:27.985
cmb6mz86t00k5cz3e00w3c876	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:53:27.99
cmb6mzqg200k7cz3ej5yk7i1v	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:53:51.65
cmb6mzqg700k9cz3eprzqx2ms	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:53:51.655
cmb6mzvbj00kbcz3evflgecm3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:53:57.967
cmb6mzvc100kdcz3e6gjzlr7x	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:53:57.985
cmb6n0iid00kfcz3evb8s40lf	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:54:28.021
cmb6n0iio00khcz3egsu2xgja	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:54:28.032
cmb6n10s600kjcz3es199vjz3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:54:51.703
cmb6n10sm00klcz3ej73yu7sg	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:54:51.719
cmb6n15li00kncz3ez2zplr72	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:54:57.942
cmb6n15lp00kpcz3eua5hsf1c	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:54:57.949
cmb6n1ss000krcz3e9o3ou96z	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:55:27.985
cmb6n1ssk00ktcz3e5bp0ulig	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:55:28.004
cmb6n2b4y00kvcz3eadvyimb0	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:55:51.778
cmb6n2b5700kxcz3evj2x20pa	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:55:51.787
cmb6n2fxh00kzcz3ewe27v95u	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:55:57.989
cmb6n2fxp00l1cz3epltbezek	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:55:57.998
cmb6n331q00l3cz3ekx15yk09	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:56:27.951
cmb6n331w00l5cz3eqi39510x	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:56:27.956
cmb6n3lh400l7cz3ecypqv4fw	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:56:51.832
cmb6n3lhp00l9cz3eq4g2bmvs	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:56:51.853
cmb6n3qbd00lbcz3e8l91n98p	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:56:58.105
cmb6n3qcc00ldcz3ey3eedri0	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:56:58.14
cmb6n4dd300lfcz3el43vjwai	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:57:27.975
cmb6n4ddg00lhcz3ecl7eva7u	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:57:27.988
cmb6n4vmo00ljcz3ef9rqcfhy	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:57:51.649
cmb6n4vmu00llcz3ehhn7q844	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:57:51.654
cmb6n50i300lncz3eeecem1ww	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:57:57.964
cmb6n50ij00lpcz3e0eb4vr78	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:57:57.979
cmb6n5nmx00lrcz3eup5jkd4r	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:58:27.946
cmb6n5nn400ltcz3edrx9yhqu	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:58:27.952
cmb6n65wm00lvcz3ez5x4erkj	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:58:51.622
cmb6n65wp00lxcz3ecbygq6oc	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:58:51.626
cmb6n6arz00lzcz3ewuvh9qjh	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:58:57.936
cmb6n6asc00m1cz3eqgzvyase	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:58:57.949
cmb6n6xxi00m3cz3ew9yl4nwh	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:59:27.942
cmb6n6xxv00m5cz3et4porkii	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:59:27.955
cmb6n7gx400m7cz3ejpbsxsfi	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:59:52.553
cmb6n7gxf00m9cz3emr1s2tbh	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:59:52.563
cmb6n7l2c00mbcz3extgdkht6	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 14:59:57.924
cmb6n7l2h00mdcz3e7g1mjb1l	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 14:59:57.929
cmb6n8qxn00mfcz3ey7q2iwv7	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:00:52.188
cmb6n8qy000mhcz3e59co6kcj	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:00:52.2
cmb6n9hwc00mjcz3evuxejrzg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:01:27.133
cmb6n9hwl00mlcz3e0xeb9xuc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:01:27.142
cmb6n9i0u00mncz3ey065dxt0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:01:27.294
cmb6n9i1b00mpcz3emhqgmhrm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:01:27.311
cmb6na0st00mrcz3edcjgrcti	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:01:51.63
cmb6na0sx00mtcz3er7vum4jr	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:01:51.634
cmb6naq5i00mvcz3e8mdjp5il	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:02:24.487
cmb6naq6500mxcz3eodvtk5hc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:02:24.509
cmb6nbb3e00mzcz3e7o2off27	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:02:51.627
cmb6nbb3j00n1cz3egqv123n2	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:02:51.631
cmb6nbcru00n3cz3et8blgumj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:02:53.803
cmb6nbcrx00n5cz3elsz8i1f8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:02:53.806
cmb6nc0ak00n7cz3e8iagv5lj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:03:24.285
cmb6nc0b800n9cz3enmcyfp3l	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:03:24.309
cmb6ncllb00nbcz3enuu298it	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:03:51.887
cmb6ncllv00ndcz3eiwi4qxju	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:03:51.908
cmb6ncn5a00nfcz3eg0lbaze1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:03:53.902
cmb6ncn5m00nhcz3el6nikm3k	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:03:53.914
cmb6ndabq00njcz3efn6pvyn6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:04:23.942
cmb6ndac300nlcz3efo7l9cvu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:04:23.955
cmb6ndvrt00nncz3ei266y8g3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:04:51.738
cmb6ndvs200npcz3e0dqj02xn	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:04:51.746
cmb6ndxfj00nrcz3ebk8f9dkv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:04:53.887
cmb6ndxfu00ntcz3eq68amddb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:04:53.899
cmb6nekl100nvcz3emkifuvf7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:05:23.893
cmb6nekl600nxcz3et9nwdrwu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:05:23.898
cmb6nf8lc00nzcz3e1i7g6c65	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:05:55.007
cmb6nf8m300o1cz3eo7nmquba	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:05:55.035
cmb6nf8m500o3cz3ep8jaynzu	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:05:55.038
cmb6nf8n800o5cz3eokkvbol1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:05:55.076
cmb6nfv1900o7cz3e1ot6x9zi	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:06:24.093
cmb6nfv1q00o9cz3eda82x0pm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:06:24.111
cmb6nggfs00obcz3ex8uerbhf	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:06:51.832
cmb6ngggd00odcz3e3kau0icr	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:06:51.854
cmb6nghyw00ofcz3elzwwmsn6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:06:53.817
cmb6nghz600ohcz3e43dgtg8q	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:06:53.827
cmb6nh5f800ojcz3e0ka2s8wy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:07:24.212
cmb6nh5fp00olcz3epmjt7w37	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:07:24.229
cmb6nhrb000oncz3ew9dgfgym	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:07:52.572
cmb6nhrbg00opcz3e1vm1z87c	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:07:52.588
cmb6nhsb800orcz3enb0vkxt3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:07:53.876
cmb6nhsbq00otcz3ela85mz30	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:07:53.894
cmb6nifjk00ovcz3el1n6vyco	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:08:23.984
cmb6nifk300oxcz3ekfwp5asq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:08:24.003
cmb6nj1ak00ozcz3e34g8lziw	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:08:52.172
cmb6nj1b200p1cz3eigmo1tqr	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:08:52.19
cmb6nj2oe00p3cz3eyec4c7ln	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:08:53.966
cmb6nj2p100p5cz3estlj8778	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:08:53.989
cmb6njqb800p7cz3e6g4sbwj1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:09:24.596
cmb6njqc900p9cz3ei0ag86pd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:09:24.633
cmb6nkbar00pbcz3etd03v18w	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:09:51.796
cmb6nkbbl00pdcz3eh50nqyhz	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:09:51.825
cmb6nkd1300pfcz3epbkoawzq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:09:54.039
cmb6nkd1p00phcz3e333ptj5y	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:09:54.061
cmb6nl02n00pjcz3e2mjoo5ca	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:10:23.903
cmb6nl03900plcz3es187tg1x	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:10:23.926
cmb6nlli600pncz3eyr7wsnxd	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:10:51.678
cmb6nllic00ppcz3ev8khkwu3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:10:51.684
cmb6nln5b00prcz3e0tmciy1z	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:10:53.807
cmb6nln5h00ptcz3ex0yjryih	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:10:53.813
cmb6nmac200pvcz3ecoddcqhm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:11:23.858
cmb6nmac800pxcz3eesz7ht6c	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:11:23.865
cmb6nmvvl00pzcz3e3wige74y	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:11:51.777
cmb6nmvwd00q1cz3e7q3220ms	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:11:51.805
cmb6nmxiz00q3cz3e3e5hkypi	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:11:53.915
cmb6nmxjm00q5cz3e995b2hgm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:11:53.939
cmb6nnkpd00q7cz3e8dkn7lhp	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:12:23.954
cmb6nnkq200q9cz3e4nev2vrx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:12:23.978
cmb6no62g00qbcz3exlepvyrj	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:12:51.641
cmb6no62m00qdcz3ecwih6pv5	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:12:51.646
cmb6no7tc00qfcz3e96p3ptf1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:12:53.905
cmb6no7u000qhcz3ekr4dq5yp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:12:53.929
cmb6nov0600qjcz3efov8uet0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:13:23.958
cmb6nov0t00qlcz3ehmqqp3uv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:13:23.981
cmb6npghm00qncz3e55tqbyt4	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:13:51.802
cmb6npgi500qpcz3e0fdvx9c5	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:13:51.821
cmb6npi2w00qrcz3e6po8twju	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:13:53.864
cmb6npi3f00qtcz3et131v42u	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:13:53.883
cmb6nq5bo00qvcz3eikta8ymz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:14:23.988
cmb6nq5c700qxcz3e62x5f6nc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:14:24.007
cmb6nqqqc00qzcz3eiz1my70i	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:14:51.732
cmb6nqqqi00r1cz3e4rt3edtl	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:14:51.739
cmb6nqsc400r3cz3egp4mml9e	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:14:53.812
cmb6nqsch00r5cz3exxahavqs	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:14:53.826
cmb6nrfic00r7cz3ez3km2uwb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:15:23.845
cmb6nrfik00r9cz3e5rxs4s16	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:15:23.852
cmb6ns12r00rbcz3ejc009luq	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:15:51.795
cmb6ns12x00rdcz3eo800tofa	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:15:51.801
cmb6ns2n600rfcz3e6w85y3ng	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:15:53.827
cmb6ns2nn00rhcz3eswadsh9y	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:15:53.844
cmb6nspsh00rjcz3esszrxn2b	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:16:23.825
cmb6nspsm00rlcz3exf33k0h4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:16:23.83
cmb6ntb8u00rncz3er9ia4g54	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:16:51.631
cmb6ntb8y00rpcz3e48lvaf0l	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:16:51.634
cmb6ntcx600rrcz3ehtulo6xo	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:16:53.803
cmb6ntcxk00rtcz3ev9y2wwvb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:16:53.816
cmb6nu78800rvcz3emv26sb5f	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:17:33.081
cmb6nu7fb00rxcz3e7vj01sgp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:17:33.335
cmb6nulqb00rzcz3e58ed151c	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:17:51.875
cmb6nulqr00s1cz3ex73q2huh	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:17:51.891
cmb6nv2dn00s3cz3e8rdeiaws	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:18:13.451
cmb6nv2dz00s5cz3e86ket3ao	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:18:13.464
cmb6nvpin00s7cz3e06k2fuy4	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:18:43.439
cmb6nvpj000s9cz3eaavgvz3l	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:18:43.452
cmb6nvvu400sbcz3ezttv02iy	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:18:51.628
cmb6nvvul00sdcz3euyzg2de7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:18:51.645
cmb6nwcof00sfcz3e1prbzcpo	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:19:13.455
cmb6nwcop00shcz3ebn5iw0hj	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:19:13.465
cmb6nwztg00sjcz3evzqvbkf2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:19:43.445
cmb6nwztu00slcz3e8el2rgbz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:19:43.458
cmb6nx65900sncz3efzjhzud5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:19:51.646
cmb6nx65t00spcz3eqcm49hfy	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:19:51.666
cmb6nxmzz00srcz3e25rw6m8i	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:20:13.487
cmb6nxn0400stcz3eet79qksm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:20:13.492
cmb6nya4r00svcz3ec7lo8lkf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:20:43.467
cmb6nya5b00sxcz3e42fvoaa6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:20:43.488
cmb6nygfh00szcz3e8o6heohd	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:20:51.629
cmb6nygfw00t1cz3expia5dip	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:20:51.644
cmb6nyxa000t3cz3el60nxwba	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:21:13.464
cmb6nyxa400t5cz3ed01vkcmh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:21:13.468
cmb6nzkf100t7cz3e6qy1rxvh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:21:43.453
cmb6nzkfg00t9cz3egn0u5kby	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:21:43.468
cmb6nzqq600tbcz3esnmtyha5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:21:51.631
cmb6nzqqk00tdcz3eufwohk4k	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:21:51.645
cmb6o07l300tfcz3eownn870x	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:22:13.48
cmb6o07l800thcz3emy1rylv5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:22:13.484
cmb6o0upo00tjcz3eod3rb9cm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:22:43.453
cmb6o0ups00tlcz3ejwqj65te	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:22:43.457
cmb6o112400tncz3e85kr5vi9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:22:51.676
cmb6o112u00tpcz3ey9fd404e	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:22:51.702
cmb6o17yq00trcz3egwtfzyzb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:23:00.627
cmb6o17z600ttcz3eyw4zt2s7	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:23:00.642
cmb6o2bbj00tvcz3eru25s5g7	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:23:51.632
cmb6o2bbo00txcz3e5wgmkojg	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:23:51.637
cmb6o2fw200tzcz3ehz5x0tay	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:23:57.555
cmb6o2fw700u1cz3eb1fvepeq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:23:57.559
cmb6o331900u3cz3e302r16ho	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:24:27.549
cmb6o331n00u5cz3e4ysuqkjp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:24:27.563
cmb6o3lm400u7cz3ekkbzb9ss	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:24:51.629
cmb6o3lmk00u9cz3ecnl8fxvd	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:24:51.644
cmb6o3q5z00ubcz3ewqofc11k	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:24:57.527
cmb6o3q6600udcz3e38a7o3wd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:24:57.534
cmb6o4dc200ufcz3etc2fz1l8	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:25:27.555
cmb6o4dcj00uhcz3e332egiwv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:25:27.571
cmb6o4vwm00ujcz3exo5najra	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:25:51.622
cmb6o4vwz00ulcz3enllaqidh	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:25:51.636
cmb6o50hf00uncz3e3wbg8qf0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:25:57.556
cmb6o50ht00upcz3ego0hg3se	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:25:57.569
cmb6o5uxn00urcz3evphyz87g	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:26:36.996
cmb6o5v7600utcz3eg87797ua	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:26:37.361
cmb6o67k200uvcz3e9jgtlb0x	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:26:53.375
cmb6o67l100uxcz3eag6jqcjb	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:26:53.411
cmb6o6e6300uzcz3e8hferyip	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:27:01.947
cmb6o6e6e00v1cz3elztfpoy9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:27:01.958
cmb6o7h4900v3cz3e3qg71l16	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:27:52.424
cmb6o7h4n00v5cz3enx9z46x2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:27:52.44
cmb6o7h4q00v7cz3ec62asrhd	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:27:52.442
cmb6o7h6m00v9cz3e5ji04s12	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:27:52.51
cmb6p5aup0001czf7u0gt5lni	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:54:10.61
cmb6p5av50003czf7z53rgv2b	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:54:10.626
cmb6p5av90005czf7x7bt9gbe	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:54:10.63
cmb6p5avl0007czf7lfp3wau7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:54:10.641
cmb6p66ni0009czf7ku1sq7m9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:54:51.823
cmb6p66nn000bczf76bdxfd6h	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:54:51.828
cmb6p66no000dczf73223uor7	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:54:51.829
cmb6p66nt000fczf72cblcg4n	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:54:51.833
cmb6p6qm1000hczf7kaeth8f5	cmb2xvddo0000czr3i311rrid	BID_ACCEPTED	0.002	\N	\N	cmb6lia440073cz3ejpckhcjd	\N	{"bidId": "cmb6lia440073cz3ejpckhcjd", "eventType": "BID_ACCEPTED"}	2025-05-27 15:55:17.69
cmb6p6qmb000jczf7hpfv749r	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:55:17.7
cmb6p6qmk000lczf7t843vtfd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.001	50	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 15:55:17.709
cmb6p7gwq000pczf745fl1fyn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:55:51.77
cmb6p7gwx000rczf77gp1v9m7	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 15:55:51.778
cmb6p7gxg000tczf71afqput5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:55:51.796
cmb6p7gxu000vczf7w87tjv61	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:55:51.81
cmb6p8r49000xczf7oq1n1ddm	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:56:51.658
cmb6p8r49000zczf70d30qs7w	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:56:51.658
cmb6p8r4e0011czf7tq4u5v9i	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:56:51.663
cmb6p8r4e0013czf77601qw4b	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 15:56:51.663
cmb6pa1j20015czf7ycju58xj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:57:51.806
cmb6pa1je0017czf78dhf8nuy	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 15:57:51.818
cmb6pa1jr0019czf7fab8wzkj	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:57:51.831
cmb6pa1k2001bczf73hovb29m	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:57:51.843
cmb6pbbol001dczf7tgtsyfrw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:58:51.621
cmb6pbbou001fczf7ir2s03tk	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:58:51.631
cmb6pbbpq001hczf7rsggvf0x	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 15:58:51.663
cmb6pbbpr001jczf7aveuazjp	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:58:51.664
cmb6pclzd001lczf7386ef17r	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:59:51.625
cmb6pclzl001nczf73b3hkwqp	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 15:59:51.633
cmb6pclzs001pczf78a7tkx1v	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 15:59:51.64
cmb6pclzs001rczf78h94u029	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 15:59:51.64
cmb6pdwa0001tczf7nf5vw515	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:00:51.624
cmb6pdwah001vczf74u6gs4j5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:00:51.642
cmb6pdwak001xczf7wb2nsdqm	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:00:51.644
cmb6pdwar001zczf7agyirb48	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:00:51.651
cmb6pe43j0021czf7ssyzrifl	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:01:01.76
cmb6pe43r0023czf7p41kga6c	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:01:01.767
cmb6pegw90025czf7toyexlvx	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:01:18.345
cmb6pegxo0027czf7zecy6x2i	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:01:18.397
cmb6pei120029czf78l5kcrb3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:01:19.815
cmb6pei1c002bczf7ucwn67bl	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:01:19.825
cmb6pfaqs002dczf7tie2ygws	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:01:57.028
cmb6pfara002fczf7ezdqbqwm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:01:57.046
cmb6pfat9002hczf73ekb5g2g	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:01:57.117
cmb6pfatd002jczf7yr0tt7oe	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:01:57.122
cmb6pfxrz002lczf7ipttyboa	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:02:26.879
cmb6pfxs9002nczf723db7tkh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:02:26.89
cmb6pfxy3002pczf7dr9xx302	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:02:27.099
cmb6pfxy8002rczf7fg1op2om	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:02:27.105
cmb6pgomn002tczf72at3esb4	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:03:01.68
cmb6pgomo002vczf7jdw9g7tp	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:03:01.681
cmb6pgopq002xczf7l2iuq6fn	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:03:01.79
cmb6pgopr002zczf7reeofckx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:03:01.792
cmb6ph8gl0031czf7ji76wjg4	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:03:27.382
cmb6ph8he0035czf7j0is3fvf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:03:27.41
cmb6ph8hd0033czf7aunstfwt	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:03:27.409
cmb6ph8i10037czf72brytpc8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:03:27.433
cmb6pq0dq0039czf7do78f2xl	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:10:16.814
cmb6pq0e4003bczf7odbjdjhm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:10:16.828
cmb6pq24q003dczf7aylx694y	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:10:19.083
cmb6pq26h003fczf7y6qbsq95	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:10:19.092
cmb6prdsx003hczf76lq3tjxp	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:11:20.866
cmb6prduc003jczf7rw0p2tld	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:11:20.916
cmb6prduh003lczf73r0wlpp2	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:11:20.921
cmb6prdvk003nczf7dfvk6nsn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:11:20.96
cmb6prfe9003pczf7te37ejft	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:11:22.929
cmb6prff3003rczf7qjbo8npi	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:11:22.959
cmb6prhbw003tczf7tnw3xqmx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:11:25.437
cmb6prhc7003vczf7xu2rtnjc	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:11:25.448
cmb6ps240003xczf74t14b7ja	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:11:52.368
cmb6ps24b003zczf7ls026war	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:11:52.379
cmb6ps4g90041czf7ifg9ylcp	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:11:55.401
cmb6ps4go0043czf77tlsq238	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:11:55.417
cmb6psqoo0045czf7rgxqv4me	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:12:24.216
cmb6psqpq0047czf7an5cpzmu	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:12:24.254
cmb6psrnj0049czf7ra5b78zq	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:12:25.471
cmb6psroa004bczf73mthmvjc	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:12:25.498
cmb6ptcea004dczf7uds31o2o	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:12:52.355
cmb6ptcei004fczf77flj47a3	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:12:52.362
cmb6pter3004hczf756c8wmyd	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:12:55.407
cmb6pterc004jczf7eqpj7ch5	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:12:55.416
cmb6ptzk5004lczf7ayjul46x	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:13:22.373
cmb6ptzkg004nczf74u672kjc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:13:22.384
cmb6pu1yd004pczf7q6503mal	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:13:25.477
cmb6pu1yo004rczf7xbbwsd88	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:13:25.488
cmbc8pzcn0079czxtx9opa65r	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:00:59.063
cmbc8pzcz007bczxtliuj9ceq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:00:59.075
cmbc8qmi0007dczxtt2et71ly	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:01:29.064
cmbc8qmid007fczxtr57dd477	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:01:29.077
cmbc8r9n9007hczxtoeksa4w0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:01:59.061
cmbc8r9nd007jczxt0n0r4lzz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:01:59.065
cmbc8rwsm007lczxtyv52jhfo	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:02:29.063
cmbc8rwsy007nczxtrjbrwc1v	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:02:29.075
cmbc8sjy5007pczxtq2j9d8y5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:02:59.07
cmbc8sjyi007rczxt9bpbq7rh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:02:59.082
cmbc8t736007tczxtj4vu4rgg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:03:29.058
cmbc8t73i007vczxtjvp63c03	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:03:29.071
cmbc8tu8r007xczxtb223w2qn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:03:59.068
cmbc8tu94007zczxtncrajpsb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:03:59.081
cmbc8zmkn008xczxtp88oiuhh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:08:29.063
cmbc8zmkq008zczxth41gj3cc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:08:29.066
cmbc909pz0091czxtevttfog6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:08:59.063
cmbc909q10093czxt55k3wil0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:08:59.066
cmbc90wv90095czxt5n3q18xf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:09:29.061
cmbc90wvc0097czxt85d49cob	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:09:29.065
cmbc91k0y0099czxt19xgx987	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:09:59.075
cmbc91k22009bczxtbvu4ca5z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:09:59.114
cmbc9275u009dczxtzuwlo3vq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:10:29.059
cmbc92767009fczxte76ck736	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:10:29.071
cmbc92ub8009hczxtzbwyk0vc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:10:59.06
cmbc92ubk009jczxty913o998	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:10:59.073
cmbc93hgn009lczxtplpfsok7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:11:29.063
cmbc93hgz009nczxtqrb2h77d	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:11:29.076
cmbc944ly009pczxtjvg0lfc7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:11:59.063
cmbc944m1009rczxtb3z5xjp1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:11:59.066
cmbc94rrj009tczxtxpv1kpyj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:12:29.071
cmb6pumpc004tczf7ro5gbk78	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:13:52.368
cmb6pumpm004vczf7ltews0jx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:13:52.378
cmb6pup58004xczf71d4xe0qu	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:13:55.532
cmb6pup5t004zczf73v4yofi1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:13:55.553
cmb6pv9ur0051czf72ax2d72i	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:14:22.372
cmb6pv9v30053czf7t3tmasfd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:14:22.383
cmb6pvc6y0055czf7uhznwtmj	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:14:25.402
cmb6pvc7e0057czf7277kyswy	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:14:25.418
cmb6pvx280059czf79oi6hwcl	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:14:52.449
cmb6pvx2i005bczf7qzim3qcl	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:14:52.458
cmb6pvze5005dczf70j8mx4x1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:14:55.47
cmb6pvzen005fczf76xdo3ml6	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:14:55.487
cmb6pwk62005hczf76s6gtlb9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:15:22.394
cmb6pwk6o005jczf7mkq0xek6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:15:22.417
cmb6pwmkd005lczf77l47sssi	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:15:25.501
cmb6pwmku005nczf7j2ps6al3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:15:25.519
cmb6px7a5005pczf7xy49ze62	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:15:52.35
cmb6px7am005rczf7uu191ft8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:15:52.367
cmb6px9nl005tczf782qvbyk4	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:15:55.426
cmb6px9o2005vczf773nqyk2t	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:15:55.442
cmb6pxuhe005xczf7k2vabw7k	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:16:22.418
cmb6pxuhx005zczf7ns46z0j2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:16:22.437
cmb6pxws60061czf7gg3ie4u6	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:16:25.398
cmb6pxwsm0063czf7rara55dg	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:16:25.414
cmb6pyhl50065czf7cex18a71	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:16:52.361
cmb6pyhl90067czf7vsryfpa0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:16:52.366
cmb6pyjxf0069czf7evu641lg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:16:55.396
cmb6pyjxu006bczf7uzgn2ka3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:16:55.411
cmb6pz4q8006dczf7t17hh811	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:17:22.353
cmb6pz4qm006fczf72bnibesq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:17:22.366
cmb6pz73b006hczf7k2c0dps9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:17:25.416
cmb6pz73q006jczf7a7kzxq71	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:17:25.43
cmb6pzrvc006lczf7hrr9tr9n	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:17:52.345
cmb6pzrvg006nczf7njy1mcze	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:17:52.349
cmb6pzu8n006pczf7nqm322kx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:17:55.416
cmb6pzu92006rczf7vkyxu2d9	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:17:55.43
cmb6q0ezx006tczf792xza2qd	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:18:22.317
cmb6q0f0c006vczf7gqp3o2zg	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:18:22.332
cmb6q0heb006xczf7mofnj829	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:18:25.428
cmb6q0hev006zczf7hajyanul	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:18:25.447
cmb6q126h0071czf701lxkt41	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:18:52.361
cmb6q126x0073czf7wxue03oa	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:18:52.378
cmb6q14io0075czf7am2fs5yx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:18:55.392
cmb6q14ir0077czf7om4ehbg0	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:18:55.396
cmb6q1pbh0079czf7cfy33xao	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:19:22.349
cmb6q1pbl007bczf75pdc3svg	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:19:22.353
cmb6q1rpn007dczf78rc5dlej	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:19:25.451
cmb6q1rq1007fczf7qrzf91r3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:19:25.465
cmb6q2ch1007hczf7qw7aobbz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:19:52.357
cmb6q2chi007jczf7ixil0p0s	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:19:52.374
cmb6q2eta007lczf7fxx4dk8l	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:19:55.391
cmb6q2eto007nczf7uzuk7xqh	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:19:55.404
cmb6q2zm1007pczf7znmg8trg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:20:22.345
cmb6q2zmg007rczf72naghz6x	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:20:22.36
cmb6q31zi007tczf7t581447n	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:20:25.422
cmb6q31zw007vczf71cucghju	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:20:25.436
cmb6q3mr2007xczf70q68uhfm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:20:52.334
cmb6q3mr5007zczf7a3041rb1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:20:52.338
cmb6q3p4a0081czf7dkfmybm8	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:20:55.403
cmb6q3p4o0083czf7o4k878hb	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:20:55.416
cmb6q49vx0085czf7rime1lec	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:21:22.318
cmb6q49wc0087czf7yormnyus	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:21:22.332
cmb6q4ca10089czf7ckr5bgjp	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:21:25.418
cmb6q4cak008bczf72g3ih9kd	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:21:25.436
cmb6q4x2m008dczf7i9z9h6o4	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:21:52.366
cmb6q4x31008fczf73q0v0mkn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:21:52.381
cmb6q4zev008hczf7rb37jklg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:21:55.4
cmb6q4zf0008jczf724bkkf0q	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:21:55.404
cmb6q5k74008lczf7hjyr5xi3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:22:22.336
cmb6q5k79008nczf7bpe7ruog	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:22:22.342
cmb6q5mk6008pczf7tbtffdh2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:22:25.399
cmb6q5mkl008rczf7y367edz5	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:22:25.413
cmb6q67d6008tczf7hnbqq9tt	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:22:52.363
cmb6q67dq008vczf7emxz47xs	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:22:52.383
cmb6q69pf008xczf7tf96m1gj	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:22:55.395
cmb6q69pj008zczf7wtu4k4io	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:22:55.399
cmb6q6uil0091czf77oir1mdv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:23:22.365
cmb6q6uip0093czf7a545eqti	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:23:22.37
cmb6q6wva0095czf7b1jd0vuw	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:23:25.415
cmb6q6wvp0097czf7ejv1aqd2	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:23:25.43
cmb6q7hni0099czf7k1j1moc1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:23:52.351
cmb6q7hnz009bczf7dtxbeccq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:23:52.367
cmb6q7k0x009dczf7qf1xsykm	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:23:55.426
cmb6q7k1b009fczf7rir5t01e	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:23:55.44
cmb6q84ry009hczf7qvouwmie	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:24:22.319
cmb6q84sd009jczf7ua6kpoec	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:24:22.333
cmb6q8765009lczf7d8ey16rj	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:24:25.421
cmb6q876j009nczf76jciyyfh	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:24:25.436
cmb6q8ry1009pczf7djl8fy3o	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:24:52.346
cmb6q8ryg009rczf703hg991t	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:24:52.36
cmb6q8ub9009tczf7uxkwmgci	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:24:55.414
cmb6q8ubo009vczf7mpqe4b0i	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:24:55.429
cmb6q9f39009xczf7koys9s98	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:25:22.341
cmb6q9f3n009zczf7sua0b5yb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:25:22.355
cmb6q9hg500a1czf7emfoz6n1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:25:25.398
cmb6q9hgm00a3czf7glsuy970	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:25:25.414
cmb6qa28d00a5czf7i16a8z5w	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:25:52.334
cmb6qa28h00a7czf7ottmslfq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:25:52.337
cmb6qa4ll00a9czf7uofvjg88	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:25:55.401
cmb6qa4lz00abczf7chtnpyad	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:25:55.416
cmb6qapdu00adczf7oa41q8jb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:26:22.339
cmb6qape900afczf7nwshw0a1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:26:22.354
cmb6qars300ahczf7wxd946ui	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:26:25.443
cmb6qarsl00ajczf7ktugu0i0	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:26:25.461
cmb6qbcjn00alczf7aj7vomha	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:26:52.355
cmb6qbck100anczf7imw284vk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:26:52.37
cmb6qbew300apczf7abaqqcc1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:26:55.396
cmb6qbewi00arczf7pu7wgm4v	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:26:55.41
cmb6qbzo200atczf7zyaozo9o	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:27:22.323
cmb6qbzo800avczf7xlr0tqs5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:27:22.329
cmb6qc21600axczf7hda27cky	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:27:25.387
cmb6qc21l00azczf7zw2b4nea	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:27:25.401
cmb6qcmu700b1czf7pi54a62f	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:27:52.352
cmb6qcmul00b3czf76t4dlgm8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:27:52.366
cmb6qcp7l00b5czf77je8saig	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:27:55.426
cmb6qcp7p00b7czf7gbd97ubf	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:27:55.43
cmb6qd9yu00b9czf7hiuawu3x	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:28:22.326
cmb6qd9yz00bbczf7dr2xgcmy	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:28:22.332
cmb6qdcci00bdczf7e83zcz8q	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:28:25.41
cmb6qdccw00bfczf73nq01s57	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:28:25.424
cmb6qdx4l00bhczf7ub1sye2d	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:28:52.342
cmb6qdx5400bjczf74703ksbg	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:28:52.36
cmb6qdzhu00blczf7jr593eug	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:28:55.411
cmb6qdzi800bnczf71tfhrz05	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:28:55.425
cmb6qek9z00bpczf7z6sg8rvl	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:29:22.343
cmb6qekae00brczf7jm7tbn0v	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:29:22.358
cmb6qemmx00btczf7iid3gjl9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:29:25.401
cmb6qemnb00bvczf7mh8r29xl	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:29:25.416
cmb6qf7fp00bxczf7i3y6a64z	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:29:52.357
cmb6qf7g700bzczf7fgupmq7h	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:29:52.375
cmb6qf9s600c1czf7j05dt3zx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:29:55.398
cmb6qf9sb00c3czf7aa9ay1e2	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:29:55.404
cmb6qfujx00c5czf75gzsn66d	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:30:22.318
cmb6qfukd00c7czf7tnhu5c86	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:30:22.333
cmb6qfwxq00c9czf77i0nz30l	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:30:25.406
cmb6qfwy400cbczf7nmqg4avv	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:30:25.42
cmb6qghqw00cdczf7rgwe5918	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:30:52.376
cmb6qghra00cfczf7ot8idqvq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:30:52.391
cmb6qgk3600chczf76157gd0s	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:30:55.41
cmb6qgk3k00cjczf79d6xjm7f	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:30:55.424
cmb6qh4vl00clczf7pa47le7j	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:31:22.353
cmb6qh4vr00cnczf7eexw8n54	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:31:22.359
cmb6qh78n00cpczf7myw1enof	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:31:25.415
cmb6qh79300crczf74dwyv0c4	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:31:25.431
cmb6qhs0w00ctczf7f9mrds8o	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:31:52.352
cmb6qhs1c00cvczf7vn5xodr3	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:31:52.368
cmb6qhudu00cxczf7ieoc3lzg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:31:55.411
cmb6qhue900czczf7q82dlwd5	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:31:55.425
cmb6qif6r00d1czf7jybgnr7h	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:32:22.371
cmb6qif7900d3czf7kvumje2h	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:32:22.389
cmb6qihj700d5czf7l93uvg7w	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:32:25.411
cmb6qihjl00d7czf71syr21gq	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:32:25.426
cmb6qj2bu00d9czf7e776u4zg	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:32:52.362
cmb6qj2c900dbczf7n07o0ofs	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:32:52.377
cmb6qj4pi00ddczf7xb0w30yj	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:32:55.447
cmb6qj4px00dfczf7k1k8r7vp	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:32:55.461
cmb6qjphd00dhczf7q8ulzo9y	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:33:22.37
cmb6qjpht00djczf7q0fdious	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:33:22.385
cmb6qjrsx00dlczf7dtqsshv8	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:33:25.378
cmb6qjrtd00dnczf7n577xo06	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:33:25.393
cmb6qkcm200dpczf7f11omkgp	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:33:52.347
cmb6qkcm700drczf7dkgfxxoi	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:33:52.351
cmb6qkezb00dtczf7zi0nbnjt	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:33:55.415
cmb6qkezf00dvczf72mxfyf3i	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:33:55.419
cmb6qkzru00dxczf7n4ici0x2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:34:22.362
cmb6qkzsa00dzczf7pmc7bc0m	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:34:22.378
cmb6ql24500e1czf7y4w7recz	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:34:25.397
cmb6ql24i00e3czf78ia0p3pl	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:34:25.411
cmb6qlmxa00e5czf7qh15nfzp	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:34:52.367
cmb6qlmxp00e7czf7ird82kan	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:34:52.381
cmb6qlp9k00e9czf7229wmnj0	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:34:55.401
cmb6qlp9o00ebczf7fsgctrz3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:34:55.405
cmb6qma2p00edczf763c1cf3s	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:35:22.37
cmb6qma3800efczf76avocoak	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:35:22.388
cmb6qmcfc00ehczf7c702jicm	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:35:25.417
cmb6qmcfr00ejczf7fo16spfz	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:35:25.431
cmb6qmx7a00elczf7qd8cq87k	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:35:52.342
cmb6qmx7f00enczf75v77edpe	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:35:52.347
cmb6qmzka00epczf7zixxn7yn	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:35:55.402
cmb6qmzke00erczf7pqken244	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:35:55.407
cmb6qnkbx00etczf7o5pzrqbn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:36:22.318
cmb6qnkcc00evczf7gpben1rg	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:36:22.333
cmb6qnmpp00exczf7rf3mxzk5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:36:25.405
cmb6qnmq300ezczf7fgf8b9h1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:36:25.42
cmb6qo7ig00f1czf72arz2nq2	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:36:52.36
cmb6qo7iw00f3czf7h1272s4c	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:36:52.376
cmb6qo9un00f5czf7kxycu6ik	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:36:55.392
cmb6qo9v200f7czf70mr6qknv	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:36:55.407
cmb6qouni00f9czf79m4uolr6	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:37:22.351
cmb6qounn00fbczf7wd5kuncv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:37:22.356
cmb6qox0e00fdczf78kudmn5r	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:37:25.406
cmb6qox0s00ffczf73xtbpuyg	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:37:25.42
cmb6qphsg00fhczf7ticsay16	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:37:52.336
cmb6qphsx00fjczf7goqtmigq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:37:52.354
cmb6qpk5w00flczf7nid6tb2o	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:37:55.413
cmb6qpk6b00fnczf7ks9k5phz	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:37:55.428
cmb6qq4xq00fpczf7weikkexb	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:38:22.334
cmb6qq4y400frczf7fgpkvfaf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:38:22.348
cmb6qq7aq00ftczf71mq92p3b	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:38:25.395
cmb6qq7b400fvczf7j9ohaw6v	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:38:25.408
cmb6qqs3j00fxczf7c4nlfqj4	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:38:52.352
cmb6qqs3o00fzczf7iivecycr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:38:52.357
cmb6qqugg00g1czf7hripwqpf	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:38:55.408
cmb6qqugu00g3czf7ggpfln5g	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:38:55.422
cmb6qrf8j00g5czf7g2qpjo6p	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:39:22.339
cmb6qrf8y00g7czf7nb3eeec5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:39:22.354
cmb6qrhl400g9czf7esy1nbuq	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:39:25.384
cmb6qrhlj00gbczf7c0kydxw3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:39:25.399
cmb6qs2ea00gdczf7yztejnj5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:39:52.355
cmb6qs2ep00gfczf7q3vunmw2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:39:52.37
cmb6qs4ra00ghczf77wvu4cpt	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:39:55.414
cmb6qs4re00gjczf78aqbq9ej	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:39:55.419
cmb6qspjp00glczf7pfjx2l2l	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:40:22.357
cmb6qspjt00gnczf7frelyek5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:40:22.362
cmb6qsrwu00gpczf75gt63boq	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:40:25.423
cmb6qsrxb00grczf7vxx1y7u5	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:40:25.439
cmb6qtcok00gtczf711ntukrt	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:40:52.341
cmb6qtcp000gvczf7ljl5opnp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:40:52.356
cmb6qtf1d00gxczf7urpwrb2d	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:40:55.394
cmb6qtf1t00gzczf7x21zlky7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:40:55.409
cmb6qtztu00h1czf79nlm04y5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:41:22.338
cmb6qtzu400h3czf7smq3z687	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:41:22.348
cmb6qu26s00h5czf7gbra9ioq	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:41:25.397
cmb6qu27600h7czf7pt1pusbe	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:41:25.411
cmb6qun0h00h9czf7aucedh1p	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:41:52.386
cmb6qun0p00hbczf7vzx39p95	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:41:52.393
cmb6qupcg00hdczf7o1kblwac	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:41:55.408
cmb6qupcu00hfczf7wdph6d4y	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:41:55.422
cmb6qva4000hhczf7fqbgy970	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:42:22.321
cmb6qva4g00hjczf73uk2ob78	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:42:22.337
cmb6qvcgz00hlczf7hq0v6ayk	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:42:25.379
cmb6qvchd00hnczf7oes3rc48	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:42:25.394
cmb6qvxaa00hpczf7t0cmzzrf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:42:52.354
cmb6qvxao00hrczf7gcl2xtll	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:42:52.368
cmb6qvzni00htczf7skjb7goj	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:42:55.423
cmb6qvzny00hvczf7cofsgiat	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:42:55.438
cmb6qwkg100hxczf7kziqdosy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:43:22.369
cmb6qwkgi00hzczf72jqi99i1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:43:22.386
cmb6qwmsu00i1czf72t3e2fjb	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:43:25.422
cmb6qwmt900i3czf77h319qkq	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:43:25.437
cmb6qx7kl00i5czf7pai2x18p	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:43:52.342
cmb6qx7l000i7czf7fgyltvda	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:43:52.357
cmb6qx9x800i9czf7qcosz50h	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:43:55.389
cmb6qx9xd00ibczf7nggrhk4t	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:43:55.393
cmb6qxuqg00idczf7o5wmk6ct	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:44:22.36
cmb6qxuqy00ifczf7hemlom62	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:44:22.378
cmb6qxx2w00ihczf71e6s4kdf	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:44:25.4
cmb6qxx3a00ijczf7kjflm0o1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:44:25.414
cmb6qyhv200ilczf7gkjka8wr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:44:52.334
cmb6qyhvg00inczf7a71uzbph	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:44:52.348
cmb6qyk8l00ipczf7euor1w3f	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:44:55.414
cmb6qyk8z00irczf7olq8hpka	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:44:55.427
cmb6qz4zx00itczf7xdrm2s8w	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:45:22.317
cmb6qz50b00ivczf76evznane	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:45:22.331
cmb6qz7e500ixczf7ghr2qtty	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:45:25.421
cmb6qz7ek00izczf7cfxjzgv2	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:45:25.436
cmb6qzs6e00j1czf71m8f87vj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:45:52.358
cmb6qzs6v00j3czf7bwl6xcxi	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:45:52.376
cmb6qzujb00j5czf792xyy3ur	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:45:55.415
cmb6qzujp00j7czf7zwq7cvji	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:45:55.429
cmb6r0faq00j9czf7kr0wnmml	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:46:22.323
cmb6r0fau00jbczf7pvs5eqm4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:46:22.327
cmb6r0hop00jdczf7e9i7c9ws	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:46:25.417
cmb6r0hp400jfczf7glqaafl2	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:46:25.432
cmb6r12gu00jhczf7tgkjxxir	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:46:52.35
cmb6r12hd00jjczf7et56bpj4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:46:52.369
cmb6r14u100jlczf7y1i9plc3	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:46:55.418
cmb6r14u700jnczf7j9fxtdbb	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:46:55.423
cmb6r1pmi00jpczf7j3ocle8z	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:47:22.362
cmb6r1pmm00jrczf7f11kemvr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:47:22.367
cmb6r1ryz00jtczf79aaskjp9	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:47:25.403
cmb6r1rzd00jvczf7dp19hesi	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:47:25.418
cmb6r2cqx00jxczf77rjlox43	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:47:52.33
cmb6r2crb00jzczf7hrcyesw5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:47:52.343
cmb6r2f4800k1czf7mwgazwrm	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:47:55.401
cmb6r2f4n00k3czf7rzasr1n2	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:47:55.416
cmb6r2zw300k5czf7s2puse2e	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:48:22.323
cmb6r2zwh00k7czf7td8v8rev	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:48:22.337
cmb6r329s00k9czf76a4bqcts	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:48:25.408
cmb6r32aa00kbczf74fvlsa3o	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:48:25.426
cmb6r3n2000kdczf7zh5tw94d	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:48:52.345
cmb6r3n2500kfczf74jlox9w6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:48:52.349
cmb6r3pf000khczf776n3bnyz	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:48:55.404
cmb6r3pfe00kjczf74jodmvq3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:48:55.418
cmb6r4a6m00klczf750nbq97q	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:49:22.319
cmb6r4a6q00knczf7lqv468cg	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:49:22.323
cmb6r4ckw00kpczf7y90dgyso	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:49:25.424
cmb6r4clc00krczf7jcnejuwl	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:49:25.44
cmb6r4xcu00ktczf7b8833brh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:49:52.351
cmb6r4xdb00kvczf7mo3xpq7y	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:49:52.367
cmb6r4zq200kxczf7neqx0smr	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:49:55.419
cmb6r4zq600kzczf7jra7mi1t	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:49:55.423
cmb6r5khs00l1czf70aesp20c	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:50:22.336
cmb6r5khx00l3czf76yv2620t	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:50:22.342
cmb6r5mv800l5czf7vay45avq	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:50:25.413
cmb6r5mvn00l7czf7ehn38utp	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:50:25.428
cmb6r67nk00l9czf757q1pkc3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:50:52.352
cmb6r67nz00lbczf7n3a7mm8b	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:50:52.368
cmb6r6a0r00ldczf7dof81wwe	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:50:55.42
cmb6r6a0w00lfczf73frenwp2	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:50:55.425
cmb6r6us300lhczf78wvusl9u	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:51:22.324
cmb6r6us800ljczf7zci5n8af	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:51:22.328
cmb6r6x5n00llczf7l2pquyby	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:51:25.403
cmb6r6x6400lnczf74nltjuwi	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:51:25.42
cmb6r7hy800lpczf76t0poud0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:51:52.352
cmb6r7hym00lrczf7mhanloqc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:51:52.366
cmb6r7kbn00ltczf70y1sk8c2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:51:55.427
cmb6r7kbu00lvczf7yom1busc	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:51:55.434
cmb6r852q00lxczf777a8x404	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:52:22.322
cmb6r852u00lzczf7qruj0wpp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:52:22.327
cmb6r87g700m1czf7vziv35hs	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:52:25.399
cmb6r87gl00m3czf7ggc4zq8d	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:52:25.414
cmb6r8s8s00m5czf75lwvkat4	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:52:52.348
cmb6r8s9600m7czf7p96v0efh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:52:52.363
cmb6r8uln00m9czf7x96nydac	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:52:55.403
cmb6r8ulr00mbczf73ih09ups	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:52:55.407
cmb6r9feo00mdczf781abas65	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:53:22.368
cmb6r9fft00mfczf7mye14hft	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:53:22.409
cmb6r9hr000mhczf78z05gitz	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:53:25.404
cmb6r9hre00mjczf7ac4lglj7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:53:25.418
cmb6ra2j100mlczf7znqzfz2a	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:53:52.333
cmb6ra2j500mnczf76nz6ypsm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:53:52.337
cmb6ra4w500mpczf7ddxoi6g1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:53:55.397
cmb6ra4w900mrczf7e26d0tay	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:53:55.402
cmb6rapon00mtczf7mz55lzh1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:54:22.344
cmb6rapp200mvczf7cxpn0mn0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:54:22.359
cmb6ras1b00mxczf7n5xwa83r	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:54:25.392
cmb6ras1q00mzczf7vawuxjya	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:54:25.406
cmb6rbcui00n1czf7mahu2kol	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:54:52.362
cmb6rbcv300n3czf7be7nj3p5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:54:52.383
cmb6rbf6r00n5czf729xu541q	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:54:55.395
cmb6rbf7400n7czf7iynngv8c	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:54:55.408
cmb6rbzzp00n9czf7zwzpha48	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:55:22.358
cmb6rc00400nbczf7k3tocwzh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:55:22.373
cmb6rc2cl00ndczf7upnp2nr5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:55:25.413
cmb6rc2cz00nfczf7at3p0ze3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:55:25.427
cmb6rcn4c00nhczf7dnxzxwaq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:55:52.332
cmb6rcn4r00njczf7tq3oxp7s	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:55:52.347
cmb6rcph900nlczf7itp9fniq	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:55:55.389
cmb6rcpho00nnczf7o157ncww	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:55:55.404
cmb6rdaa100npczf76tfi6n2n	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:56:22.345
cmb6rdaab00nrczf7hmazurwh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:56:22.356
cmb6rdcn100ntczf74lztr15k	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:56:25.406
cmb6rdcni00nvczf752ice3pl	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:56:25.422
cmb6rdxfk00nxczf7x6jykar0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:56:52.352
cmb6rdxfy00nzczf7vhdahg9u	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:56:52.366
cmb6rdzs700o1czf7w8b2zq9q	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:56:55.399
cmb6rdzsl00o3czf7l8elguv1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:56:55.413
cmb6rekk400o5czf7yu2eccg7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:57:22.325
cmb6rekkj00o7czf7r2qflgcq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:57:22.34
cmb6remxf00o9czf7ecsjqcy2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:57:25.395
cmb6remxt00obczf7ehiplg3l	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:57:25.41
cmb6rf7qb00odczf7771sa9l5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:57:52.355
cmb6rf7qg00ofczf7lrmo5sh6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:57:52.36
cmb6rfa2y00ohczf73fbmwux2	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:57:55.402
cmb6rfa3200ojczf7b64p9xel	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:57:55.407
cmb6rfuvi00olczf7zzsbb988	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:58:22.35
cmb6rfuvz00onczf7d297x9r2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:58:22.368
cmb6rfx8900opczf7bv5bjwkv	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:58:25.401
cmb6rfx8r00orczf7ykshmgm9	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:58:25.419
cmb6rgi1300otczf7wqcp503k	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:58:52.359
cmb6rgi1700ovczf75kin6mpo	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:58:52.364
cmb6rgkdy00oxczf77z6rgh2i	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:58:55.415
cmb6rgke400ozczf7lgmtz99x	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:58:55.421
cmb6rh55w00p1czf76zixo69h	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:59:22.341
cmb6rh56a00p3czf72d4mme93	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:59:22.355
cmb6rh7j100p5czf7pybus185	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:59:25.405
cmb6rh7jg00p7czf7cbxmlyim	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:59:25.42
cmb6rhsar00p9czf7dnk2vcsi	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:59:52.323
cmb6rhsax00pbczf7fwm8hktv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 16:59:52.33
cmb6rhuom00pdczf7k80s42tx	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 16:59:55.415
cmb6rhup000pfczf73y056lff	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 16:59:55.429
cmb6rifg100phczf7cn5uq70i	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:00:22.322
cmb6rifg900pjczf7emlou1z3	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:00:22.329
cmb6rihu200plczf7qv1u8hto	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:00:25.419
cmb6rihui00pnczf7he2guqlt	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:00:25.434
cmb6rj2ln00ppczf7arhry305	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:00:52.331
cmb6rj2m200prczf7isw34jkc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:00:52.346
cmb6rj4z400ptczf7ju28mnfc	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:00:55.409
cmb6rj4zi00pvczf7510qsqs1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:00:55.423
cmb6rjpr700pxczf7oc5sx1er	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:01:22.339
cmb6rjprb00pzczf71ed3l2gw	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:01:22.343
cmb6rjs4b00q1czf7611qzsca	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:01:25.403
cmb6rjs4p00q3czf7bjrmr4iv	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:01:25.418
cmb6rkcwy00q5czf7jt065bfc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:01:52.354
cmb6rkcxd00q7czf7dcmy2ho2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:01:52.369
cmb6rkf9x00q9czf7w5po8j5e	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:01:55.413
cmb6rkfaa00qbczf7tuechtbl	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:01:55.426
cmb6rl02700qdczf7a01gt1gj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:02:22.351
cmb6rl02r00qfczf7uzf6xjah	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:02:22.372
cmb6rl2eh00qhczf732p6b8i8	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:02:25.385
cmb6rl2ew00qjczf7hrtibx9w	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:02:25.4
cmb6rln7600qlczf75d971546	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:02:52.338
cmb6rln7a00qnczf7bpxw9umy	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:02:52.343
cmb6rlpkk00qpczf7n4mezv4b	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:02:55.413
cmb6rlpko00qrczf7g3xskmyn	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:02:55.417
cmb6rmac600qtczf7h93n1nzz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:03:22.326
cmb6rmacn00qvczf79xlvfiqx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:03:22.344
cmb6rmcpp00qxczf7qgpxbfdb	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:03:25.406
cmb6rmcq400qzczf75o81o7sh	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:03:25.42
cmb6rn6o800r1czf7y2ds7bwj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:04:04.232
cmb6rn6or00r3czf7sh88xn37	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:04:04.251
cmb6rnksq00r5czf71ybplvub	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:04:22.538
cmb6rnkt600r7czf7vlr0n61z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:04:22.554
cmb6rnmzz00r9czf7e2bk894u	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:04:25.392
cmb6rnn0d00rbczf7otokl19g	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:04:25.406
cmb6ro7ry00rdczf7exmom11g	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:04:52.319
cmb6ro7s300rfczf76lr08wr2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:04:52.324
cmb6roa5d00rhczf7fjlh5ln5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:04:55.394
cmb6roa5t00rjczf7osfanjtq	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:04:55.409
cmb6rovgs00rlczf79wik1ty4	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:05:23.02
cmb6rovhj00rnczf7akls28t1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:05:23.047
cmb6roxbl00rpczf7bv4296pc	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:05:25.426
cmb6roxc400rrczf7rj7w2zr7	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:05:25.444
cmb6rpi7400rtczf7te88lqkc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:05:52.48
cmb6rpib700rvczf7ywkh73be	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:05:52.628
cmb6rpks500rxczf70w3g1dqv	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:05:55.829
cmb6rpksw00rzczf7p8vo8n3h	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:05:55.856
cmb6rq58n00s1czf7njd8hp5j	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:06:22.343
cmb6rq58t00s3czf7p0oh8rgq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:06:22.349
cmb6rq7lg00s5czf7yfbxnecg	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:06:25.397
cmb6rq7lw00s7czf7ue08zfh8	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:06:25.413
cmb6rqta100s9czf7gab6kw85	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:06:53.497
cmb6rqtbd00sbczf757nmh5tn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:06:53.545
cmb6rquv500sdczf7ys3eb7d6	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:06:55.553
cmb6rquvy00sfczf732rcsclg	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:06:55.582
cmb6rrfjp00shczf72r8e52zf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:07:22.358
cmb6rrfjz00sjczf73f66ibgs	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-27 17:07:22.367
cmb6rrhyo00slczf7xrytwnbu	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-27 17:07:25.488
cmb6rrhze00snczf7by9sdp9i	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-27 17:07:25.515
cmbc6t69f0001czxtr5s3g3ch	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:07:28.755
cmbc6t69o0003czxtopce6ajx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:07:28.765
cmbc6t6am0005czxtmr4j5dbr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:07:28.798
cmbc6t6aq0007czxt16bzuurb	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:07:28.802
cmbc6uebs0009czxtogfn24ve	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:08:25.864
cmbc6ueby000bczxta7swd9af	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:08:25.87
cmbc6v1e2000dczxtqyuzicjh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:08:55.754
cmbc6v1f4000fczxtrmwknwhf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:08:55.793
cmbc6voja000hczxtgsxbdm94	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:09:25.751
cmbc6vojm000jczxtn6u2hd60	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:09:25.763
cmbc73sij000lczxtknsrlxbh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:15:44.156
cmbc73siz000nczxtgimp6vkm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:15:44.171
cmbc73sjr000pczxt5uo0tpn0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:15:44.199
cmbc73sjv000rczxt3gjxc7r5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:15:44.204
cmbc7p76m000tczxt9xs7ma4r	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:32:22.942
cmbc7p799000vczxts9m5hp6j	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:32:23.037
cmbc7p94c000xczxt9mg5kvw1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:32:25.452
cmbc7p965000zczxtifsysexv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:32:25.517
cmbc7pz510011czxtg1gevewj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:32:59.173
cmbc7pz5f0013czxtx34fmksx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:32:59.188
cmbc7qm7g0015czxtaso3kcdx	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:33:29.069
cmbc7qm9w0017czxtfe3zr2i0	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:33:29.156
cmbc7r9d40019czxtxln18sqd	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:33:59.08
cmbc7r9dh001bczxtxnasw0fw	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:33:59.093
cmbc7rwhz001dczxtxbh4r8rn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:34:29.063
cmbc7rwic001fczxt1ssnswm2	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:34:29.076
cmbc7sjna001hczxtrvv564ul	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:34:59.062
cmbc7sjnd001jczxtu4tk5bnx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:34:59.065
cmbc7t6sq001lczxt7qujwzgc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:35:29.066
cmbc7t6t4001nczxts6pkwv8d	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:35:29.08
cmbc7ttxv001pczxttcba540j	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:35:59.059
cmbc7tty8001rczxtxdtdgx1d	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:35:59.072
cmbc7uh3c001tczxtkkkx7ijm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:36:29.065
cmbc7uh3p001vczxtej53c5h9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:36:29.078
cmbc7v48n001xczxtb1i8s3g3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:36:59.064
cmbc7v49p001zczxtp03i9aq6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:36:59.102
cmbc7vrdz0021czxtlcfto71c	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:37:29.064
cmbc7vrec0023czxtnvk8i3ap	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:37:29.076
cmbc7wej90025czxtj5cp9qn0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:37:59.062
cmbc7wejc0027czxt4cyeuyt4	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:37:59.065
cmbc7x1p10029czxtx6g71zh0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:38:29.078
cmbc7x1pf002bczxti78u0fgo	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:38:29.091
cmbc7xou0002dczxtz993l23c	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:38:59.065
cmbc7xoud002fczxt1msc0g7i	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:38:59.077
cmbc7ybz9002hczxtpu2m521s	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:39:29.062
cmbc7ybzl002jczxtqc7gnvxy	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:39:29.074
cmbc7yz4m002lczxtutgc82ev	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:39:59.062
cmbc7yz5o002nczxtsyu4gj1c	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:39:59.1
cmbc7zm9w002pczxtxw86sron	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:40:29.06
cmbc7zma8002rczxthqvj96rd	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:40:29.073
cmbc809f9002tczxt3d62x1mq	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:40:59.061
cmbc809gb002vczxtpp4kcehm	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:40:59.099
cmbc80wkm002xczxta2422xnl	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:41:29.062
cmbc80wky002zczxt5vm7qjyr	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:41:29.075
cmbc81jpu0031czxt9c9kber3	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:41:59.058
cmbc81jqw0033czxt50ct4e6g	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:41:59.097
cmbc826va0035czxtd6vi26vw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:42:29.063
cmbc826vn0037czxtgrjxvhkn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:42:29.075
cmbc82u0l0039czxtvn7fi4cr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:42:59.061
cmbc82u1n003bczxtk15bztwv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:42:59.1
cmbc83h5x003dczxtmyvlyznd	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:43:29.061
cmbc83h69003fczxt2rt6tak5	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:43:29.073
cmbc844bk003hczxtt3l8cza0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:43:59.073
cmbc844cl003jczxtj77odgmk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:43:59.109
cmbc84rgr003lczxt8vvtz155	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:44:29.067
cmbc84rh3003nczxtzfffivlh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:44:29.079
cmbc85ely003pczxtzxn7l9lj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:44:59.062
cmbc85en0003rczxtgnv7yl1z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:44:59.101
cmbc861rg003tczxtl4hfyt2m	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:45:29.068
cmbc861rt003vczxtdggd62s7	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:45:29.081
cmbc86owp003xczxt0i4a8qtj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:45:59.066
cmbc86oxs003zczxt53li2skt	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:45:59.104
cmbc87c1x0041czxturl0bh1e	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:46:29.061
cmbc87c290043czxtj0pizdm1	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:46:29.073
cmbc87z780045czxttz9qvajv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:46:59.061
cmbc87z7b0047czxtlp0uh90t	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:46:59.063
cmbc88mcm0049czxtpiozabwy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:47:29.063
cmbc88mcz004bczxt5yivpyhh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:47:29.075
cmbc899i5004dczxt70r9fle5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:47:59.07
cmbc899ii004fczxtokqic7s9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:47:59.082
cmbc89wnb004hczxt7tcgdld5	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:48:29.063
cmbc89wnn004jczxtbrwqvruw	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:48:29.076
cmbc8ajsz004lczxt4jhmyzoa	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:48:59.076
cmbc8ajtd004nczxtl121vfq7	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:48:59.089
cmbc8b6y1004pczxtariqnybj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:49:29.066
cmbc8b6yd004rczxtyeq9t203	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:49:29.078
cmbc8bu38004tczxthh8hue9l	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:49:59.061
cmbc8bu3l004vczxtg9q5lrxv	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:49:59.073
cmbc8ch8l004xczxt9ac1h1gs	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:50:29.061
cmbc8ch8x004zczxtsqsc1usf	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:50:29.073
cmbc8d4dy0051czxt2qbe0hun	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:50:59.063
cmbc8d4ea0053czxt8sniyciq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:50:59.075
cmbc8drjb0055czxtj52spig7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:51:29.063
cmbc8drjn0057czxtmjp3h4nc	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:51:29.075
cmbc8eeot0059czxtecuu28ee	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:51:59.07
cmbc8eep6005bczxtiojdhynh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:51:59.083
cmbc8f1ty005dczxtzz7mol43	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:52:29.062
cmbc8f1ua005fczxtp65e4y09	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:52:29.075
cmbc8foz9005hczxtdr7u7whh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:52:59.062
cmbc8fozl005jczxtjlbapm6x	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:52:59.074
cmbc8gc4t005lczxt3wrys1md	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:53:29.069
cmbc8gc56005nczxta2flxgby	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:53:29.082
cmbc8gzai005pczxtlnp5w715	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:53:59.082
cmbc8gzav005rczxtd3161089	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:53:59.095
cmbc8hmf8005tczxt6zcb1gxi	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:54:29.06
cmbc8hmfk005vczxtt7crjnqg	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:54:29.072
cmbc8i9kq005xczxtsw4uq2ub	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:54:59.067
cmbc8i9kt005zczxtpkmrl8ox	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:54:59.07
cmbc8iwq10061czxt3noyjrsh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:55:29.066
cmbc8iwqe0063czxto3bylfxw	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:55:29.078
cmbc8jjvd0065czxtr8vz2nsy	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:55:59.065
cmbc8jjvf0067czxtbcv8hzna	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:55:59.068
cmbc8k70r0069czxto4ix77jv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:56:29.067
cmbc8k714006bczxtn51rx6h8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:56:29.08
cmbc8ku65006dczxt94x2o6dr	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:56:59.069
cmbc8ku77006fczxt5jxeexiz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:56:59.108
cmbc8lhb6006hczxt0ci70mto	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:57:29.059
cmbc8lhbj006jczxt3qp04kt7	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:57:29.071
cmbc8m4gi006lczxtdmhsfqnh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:57:59.059
cmbc8m4gu006nczxtfcamr34c	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:57:59.071
cmbc8mrlw006pczxthq6h4d0w	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:58:29.061
cmbc8mrm9006rczxtlrg72hvh	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:58:29.073
cmbc8nerl006tczxtsi7xss7n	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:58:59.073
cmbc8nes6006vczxtl4npjaof	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:58:59.094
cmbc8o1ws006xczxtq29uhn66	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:59:29.069
cmbc8o1x5006zczxt86gu29wp	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:59:29.082
cmbc8op250071czxtl62q31bc	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 12:59:59.07
cmbc8op2i0073czxt0bm2jmfx	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 12:59:59.082
cmbc8pc780075czxt0vpfe3vs	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:00:29.061
cmbc8pc7l0077czxt6x7z102i	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:00:29.073
cmbc8uhef0081czxtb87wh8y1	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:04:29.08
cmbc8uhet0083czxtctbizvux	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:04:29.093
cmbc8v4jf0085czxtqpfgnvqw	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:04:59.067
cmbc8v4jr0087czxt6bxckt9m	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:04:59.08
cmbc8vron0089czxtdtijku83	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:05:29.063
cmbc8vroz008bczxttx2d5qis	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:05:29.076
cmbc8weu0008dczxtm3t63jgj	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:05:59.064
cmbc8weuc008fczxtbmbvfi2b	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:05:59.076
cmbc8x1zi008hczxt3d5qtr87	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:06:29.07
cmbc8x1zv008jczxtj8y6v8si	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:06:29.083
cmbc8xp4q008lczxtzq5p9m1f	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:06:59.067
cmbc8xp4t008nczxty23uadis	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:06:59.069
cmbc8yc9x008pczxtm8p5frcs	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:07:29.061
cmbc8yca9008rczxtpv7z21rq	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:07:29.074
cmbc8yzfi008tczxt5qr0f1oh	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:07:59.071
cmbc8yzfl008vczxt53s91dul	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:07:59.074
cmbc94rsl009vczxteaovghs8	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:12:29.109
cmbc95ewi009xczxtqifrg26q	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:12:59.059
cmbc95exl009zczxtq1hnnkcn	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:12:59.097
cmbc9622000a1czxtca69ditk	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:13:29.064
cmbc9622c00a3czxt2618e9kj	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:13:29.077
cmbc96p7800a5czxtx3qggfmt	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:13:59.061
cmbc96p7l00a7czxtag5isiv6	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:13:59.073
cmbc97cck00a9czxt5e1qa47e	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:14:29.06
cmbc97ccx00abczxttne869x9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:14:29.073
cmbc97zi200adczxt0vvdbmfn	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:14:59.066
cmbc97zjd00afczxtuvlkvnv9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:14:59.113
cmbc98mng00ahczxt8sz8t2ab	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:15:29.069
cmbc98mnt00ajczxtdjuc6bgg	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:15:29.081
cmbc999sl00alczxt3dxlp0oz	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:15:59.062
cmbc999to00anczxtb8yg24ah	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:15:59.1
cmbc99wy200apczxtfeeiai31	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:16:29.066
cmbc99wyf00arczxtt2gcxxvi	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:16:29.079
cmbc9ak3d00atczxtotn7685g	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:16:59.065
cmbc9ak3l00avczxt4p8yy2po	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:16:59.073
cmbc9b78r00axczxt4ehb09v0	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:17:29.068
cmbc9b79u00azczxtyqql47l7	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:17:29.106
cmbc9budz00b1czxt41vxu3lm	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:17:59.064
cmbc9buec00b3czxt5e981e1a	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:17:59.077
cmbc9chje00b5czxtwsiinju9	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:18:29.066
cmbc9chjq00b7czxtuc8731j9	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:18:29.079
cmbc9d4om00b9czxtop1in49d	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:18:59.063
cmbc9d4pp00bbczxty87u3o2g	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:18:59.101
cmbc9drtu00bdczxtk31nbttv	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:19:29.059
cmbc9dru700bfczxtpyr081iw	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:19:29.071
cmbc9eezo00bhczxtukhlrwci	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 13:19:59.077
cmbc9eezr00bjczxtrixc4m9s	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 13:19:59.08
cmbce6fr60001czndx1k8jfed	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:33:44.898
cmbce6frh0003czndsifvpipk	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 15:33:44.909
cmbce6ft60005czndzosgewhf	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:33:44.971
cmbce6fta0007cznd3nmerj5a	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 15:33:44.975
cmbce77w50009czndwjgy90u7	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:34:21.365
cmbce77wk000bczndsg4bs0tz	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 15:34:21.38
cmbce7v5y000dczndd6f8twhp	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:34:51.526
cmbce7v6i000fczndaz9kqc7z	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 15:34:51.547
cmbce8i2q000hczndpouw435x	cmb2xvddo0000czr3i311rrid	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:35:21.219
cmbce8i34000jcznddz6wv0dy	cmb2xvddo0000czr3i311rrid	AVG_PRICE	0.0015	0.0015	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 2, "acceptedBidsCount": 2}	2025-05-31 15:35:21.233
cmbcepkzh000lczndxt0l3uc5	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:48:38.141
cmbcepkzx000nczndx58wgw2p	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:48:38.157
cmbcepl0o000pczndhs59fzww	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:48:38.184
cmbcepl0r000rczndzowonvmu	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:48:38.187
cmbceqio6000tczndx9mv29vn	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:49:21.798
cmbceqiok000vcznd11f56ouk	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:49:21.813
cmbcer5rp000xczndqdui0kh1	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:49:51.734
cmbcer5rs000zcznd6z1a94ln	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:49:51.737
cmbcersw40011czndep6s6utb	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:50:21.701
cmbcersw70013czndms0y8g0d	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:50:21.704
cmbcesg180015czndfaosrig0	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:50:51.692
cmbcesg1b0017czndvubsupt6	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:50:51.696
cmbcet36v0019czndypkoqnb0	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:51:21.703
cmbcet36z001bczndsxnj4wm1	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:51:21.707
cmbcetqcd001dczndzx1pd38e	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:51:51.709
cmbcetqcf001fczndz2ihot86	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:51:51.712
cmbceudhv001hczndml3q2ns8	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:52:21.716
cmbceudhy001jczndp58w8rqd	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:52:21.719
cmbcev0n2001lcznd3k8kncvo	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:52:51.711
cmbcev0n6001nczndgphi12db	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:52:51.714
cmbcevnsf001pczndif4b4lb4	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:53:21.711
cmbcevnsi001rcznduj7bv4uz	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:53:21.715
cmbceweqx001tczndli16fwda	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:53:56.649
cmbcewer3001vcznd5o7w9uz3	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:53:56.656
cmbcewy3c001xcznd2kz8w278	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:54:21.72
cmbcewy3k001zczndc3aquk7v	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:54:21.728
cmbcexl970021czndqfzambhn	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:54:51.739
cmbcexl9j0023czndskja3bly	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:54:51.752
cmbcey8d80025czndg5t94tym	cmb2wcefj0000czlrzwoxaitp	FLOOR_PRICE	0.0001	0.0001	0	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-05-31 15:55:21.692
cmbcey8db0027czndwj8ijsyr	cmb2wcefj0000czlrzwoxaitp	AVG_PRICE	0.001	0.001	0	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-05-31 15:55:21.695
cmbin7y2d0003czfoq4u36mfw	cmbilzsjl0000czzpnmbke17t	BID_PLACED	0.001	\N	\N	cmbin7y0e0001czfoaq160ksg	\N	{"bidId": "cmbin7y0e0001czfoaq160ksg", "eventType": "BID_PLACED"}	2025-06-05 00:33:28.886
cmbin9pa80007czfout351azt	cmbilzsjl0000czzpnmbke17t	BID_ACCEPTED	0.001	\N	\N	cmbin7y0e0001czfoaq160ksg	\N	{"bidId": "cmbin7y0e0001czfoaq160ksg", "eventType": "BID_ACCEPTED"}	2025-06-05 00:34:50.816
cmbin9paw0009czfohv5vuqzy	cmbilzsjl0000czzpnmbke17t	FLOOR_PRICE	1e-05	\N	\N	\N	\N	{"source": "collection_listing", "tokenCount": 0}	2025-06-05 00:34:50.841
cmbin9pb9000bczfo662czx8t	cmbilzsjl0000czzpnmbke17t	AVG_PRICE	0.001	\N	\N	\N	\N	{"timeframe": "7_days", "salesCount": 0, "sampleSize": 1, "acceptedBidsCount": 1}	2025-06-05 00:34:50.853
\.


--
-- Data for Name: evm_collection_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evm_collection_tokens (id, land_listing_id, nft_id, token_id, is_main_token, token_uri, owner_address, mint_transaction_hash, mint_timestamp, mint_status, is_listed, listing_price, "createdAt", "updatedAt") FROM stdin;
cmbk04knt0003cztibmadp9yd	cmbilzsjl0000czzpnmbke17t	\N	12	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:22:32.729	2025-06-06 00:17:02.122
cmbk04knx0005cztilrqjtyvd	cmbilzsjl0000czzpnmbke17t	\N	13	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:22:32.734	2025-06-06 00:17:02.129
cmbk04ko20007cztii8abei5o	cmbilzsjl0000czzpnmbke17t	\N	14	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:22:32.738	2025-06-06 00:17:02.131
cmbk04ko70009cztise955c6g	cmbilzsjl0000czzpnmbke17t	\N	15	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:22:32.743	2025-06-06 00:17:02.135
cmbk04kob000bczti3strjt3u	cmbilzsjl0000czzpnmbke17t	\N	16	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:22:32.748	2025-06-06 00:17:02.138
cmbk04koh000dcztif8a6wibl	cmbilzsjl0000czzpnmbke17t	\N	17	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:22:32.753	2025-06-06 00:17:02.14
cmbk04kom000fcztizfg6fqo3	cmbilzsjl0000czzpnmbke17t	\N	18	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:22:32.758	2025-06-06 00:17:02.143
cmbk04kop000hczti1ac5oaub	cmbilzsjl0000czzpnmbke17t	\N	19	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:22:32.762	2025-06-06 00:17:02.146
cmbk04kos000jcztianhpikjy	cmbilzsjl0000czzpnmbke17t	\N	20	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:22:32.764	2025-06-06 00:17:02.148
cmb6i2mj90001cztjx3yoxez9	cmb2xvddo0000czr3i311rrid	\N	102	f	https://platz.land/api/metadata/16/102	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-05-27 12:36:08.469	2025-05-27 15:09:43.548
cmb6i2ncg0005cztjo756c6wu	cmb2xvddo0000czr3i311rrid	\N	105	f	https://platz.land/api/metadata/16/105	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-05-27 12:36:09.52	2025-05-27 15:09:43.558
cmb6hvgi20001czun1n621za6	cmb2xvddo0000czr3i311rrid	\N	106	f	https://platz.land/api/metadata/16/106	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-05-27 12:30:34.058	2025-05-27 15:09:43.562
cmb6i2nj30007cztjuh8vrrdb	cmb2xvddo0000czr3i311rrid	\N	107	f	https://platz.land/api/metadata/16/107	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-05-27 12:36:09.76	2025-05-27 15:09:43.565
cmb6i2n720003cztj5tp1zpif	cmb2xvddo0000czr3i311rrid	\N	104	f	https://platz.land/api/metadata/16/104	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-05-27 12:36:09.327	2025-05-27 15:55:17.598
cmbk04kn70001cztizjgqxc3c	cmbilzsjl0000czzpnmbke17t	\N	10	t		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:22:32.707	2025-06-05 23:22:32.707
cmbcwt6fv0003czaqswxd6yot	cmbcw65oh0000czofedd5gs8s	\N	113	f	http://localhost:3000/api/static/collections/cmbcw65oh0000czofedd5gs8s/child-tokens/113.json	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	SUCCESS	f	\N	2025-06-01 00:15:19.003	2025-06-06 00:05:12.044
cmbcwt6g20005czaqmyab7adn	cmbcw65oh0000czofedd5gs8s	\N	114	f	http://localhost:3000/api/static/collections/cmbcw65oh0000czofedd5gs8s/child-tokens/114.json	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	SUCCESS	f	\N	2025-06-01 00:15:19.01	2025-06-06 00:05:12.049
cmbcwt6g80007czaq3xq2n1sg	cmbcw65oh0000czofedd5gs8s	\N	115	f	http://localhost:3000/api/static/collections/cmbcw65oh0000czofedd5gs8s/child-tokens/115.json	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	SUCCESS	f	\N	2025-06-01 00:15:19.017	2025-06-06 00:05:12.056
cmbcwt6ge0009czaqgnnfu6mz	cmbcw65oh0000czofedd5gs8s	\N	116	f	http://localhost:3000/api/static/collections/cmbcw65oh0000czofedd5gs8s/child-tokens/116.json	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	SUCCESS	f	\N	2025-06-01 00:15:19.022	2025-06-06 00:05:12.061
cmbcwt6gl000bczaqzt9lhvv5	cmbcw65oh0000czofedd5gs8s	\N	117	f	http://localhost:3000/api/static/collections/cmbcw65oh0000czofedd5gs8s/child-tokens/117.json	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	SUCCESS	f	\N	2025-06-01 00:15:19.03	2025-06-06 00:05:12.065
cmbcwt6gr000dczaqec7wi28m	cmbcw65oh0000czofedd5gs8s	\N	118	f	http://localhost:3000/api/static/collections/cmbcw65oh0000czofedd5gs8s/child-tokens/118.json	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	SUCCESS	f	\N	2025-06-01 00:15:19.035	2025-06-06 00:05:12.069
cmbcwt6gx000fczaqivp3rco3	cmbcw65oh0000czofedd5gs8s	\N	119	f	http://localhost:3000/api/static/collections/cmbcw65oh0000czofedd5gs8s/child-tokens/119.json	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	SUCCESS	f	\N	2025-06-01 00:15:19.041	2025-06-06 00:05:12.075
cmbcwt6h3000hczaq1srmbklc	cmbcw65oh0000czofedd5gs8s	\N	120	f	http://localhost:3000/api/static/collections/cmbcw65oh0000czofedd5gs8s/child-tokens/120.json	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	SUCCESS	f	\N	2025-06-01 00:15:19.047	2025-06-06 00:05:12.077
cmbcwt6h8000jczaqknmmco5a	cmbcw65oh0000czofedd5gs8s	\N	121	f	http://localhost:3000/api/static/collections/cmbcw65oh0000czofedd5gs8s/child-tokens/121.json	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	SUCCESS	f	\N	2025-06-01 00:15:19.052	2025-06-06 00:05:12.084
cmbcwt6hd000lczaqo8jak2h0	cmbcw65oh0000czofedd5gs8s	\N	122	f	http://localhost:3000/api/static/collections/cmbcw65oh0000czofedd5gs8s/child-tokens/122.json	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	SUCCESS	f	\N	2025-06-01 00:15:19.057	2025-06-06 00:05:12.089
cmbk0h3oi0001cz8ph3j86jro	cmbil2r2w0000czkpsf43ah2o	\N	0	t		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.25	2025-06-06 00:05:12.133
cmbk0h3on0003cz8pofdm9d7i	cmbil2r2w0000czkpsf43ah2o	\N	1	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.256	2025-06-06 00:05:12.135
cmbk0h3os0005cz8pgp2m3co8	cmbil2r2w0000czkpsf43ah2o	\N	2	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.26	2025-06-06 00:05:12.137
cmbk0h3ow0007cz8pabmmpk6r	cmbil2r2w0000czkpsf43ah2o	\N	3	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.264	2025-06-06 00:05:12.141
cmbk0h3p00009cz8pfa7d6nmb	cmbil2r2w0000czkpsf43ah2o	\N	4	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.269	2025-06-06 00:05:12.143
cmbk0h3p5000bcz8p1w5ydlom	cmbil2r2w0000czkpsf43ah2o	\N	5	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.273	2025-06-06 00:05:12.146
cmbk0h3p9000dcz8pq127crj5	cmbil2r2w0000czkpsf43ah2o	\N	6	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.278	2025-06-06 00:05:12.148
cmbk0h3pd000fcz8pzsb58x34	cmbil2r2w0000czkpsf43ah2o	\N	7	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.281	2025-06-06 00:05:12.149
cmbk0h3pf000hcz8py6dl9zh6	cmbil2r2w0000czkpsf43ah2o	\N	8	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.283	2025-06-06 00:05:12.151
cmbk0h3pi000jcz8pi1fdsavk	cmbil2r2w0000czkpsf43ah2o	\N	9	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.286	2025-06-06 00:05:12.153
cmbk0h3pr000lcz8pu16tfhn0	cmb02r4rb0001cz1n2j6onvpx	\N	716	t		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.296	2025-06-06 00:05:12.155
cmbk0h3pu000ncz8ppfqvvopj	cmb02r4rb0001cz1n2j6onvpx	\N	717	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.298	2025-06-06 00:05:12.157
cmbk0h3pw000pcz8pfcf93nth	cmb02r4rb0001cz1n2j6onvpx	\N	718	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.301	2025-06-06 00:05:12.158
cmbk0h3py000rcz8psmtbpx63	cmb02r4rb0001cz1n2j6onvpx	\N	719	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.302	2025-06-06 00:05:12.16
cmbk0h3q0000tcz8puyaj827x	cmb02r4rb0001cz1n2j6onvpx	\N	720	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.305	2025-06-06 00:05:12.161
cmbk0h3tl002tcz8pyp3gi0me	cmb2wcefj0000czlrzwoxaitp	\N	92	t		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.433	2025-06-05 23:32:17.433
cmbk0h3tp002vcz8pohbq4x6m	cmb2wcefj0000czlrzwoxaitp	\N	93	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.438	2025-06-05 23:32:17.438
cmbk0h3tt002xcz8p5ch12kh3	cmb2wcefj0000czlrzwoxaitp	\N	94	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.441	2025-06-05 23:32:17.441
cmbk0h3tx002zcz8ppgtospk0	cmb2wcefj0000czlrzwoxaitp	\N	95	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.445	2025-06-05 23:32:17.445
cmbk0h3tz0031cz8p8e15zynu	cmb2wcefj0000czlrzwoxaitp	\N	96	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.448	2025-06-05 23:32:17.448
cmbk0h3u20033cz8ppef7bjep	cmb2wcefj0000czlrzwoxaitp	\N	97	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.45	2025-06-05 23:32:17.45
cmbk0h3u40035cz8phhvcg1r6	cmb2wcefj0000czlrzwoxaitp	\N	98	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.452	2025-06-05 23:32:17.452
cmbk0h3u70037cz8p1it9ztk0	cmb2wcefj0000czlrzwoxaitp	\N	99	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.455	2025-06-05 23:32:17.455
cmbk0h3ua0039cz8p0k6uye5g	cmb2wcefj0000czlrzwoxaitp	\N	100	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.458	2025-06-05 23:32:17.458
cmbk0h3ud003bcz8pojfnotgr	cmb2wcefj0000czlrzwoxaitp	\N	101	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.461	2025-06-05 23:32:17.461
cmbk0h3uk003dcz8px2ku8aqt	cmb2xvddo0000czr3i311rrid	\N	103	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.468	2025-06-05 23:32:17.468
cmbk0h3un003fcz8ptjseaphy	cmb2xvddo0000czr3i311rrid	\N	108	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.471	2025-06-05 23:32:17.471
cmbk0h3up003hcz8pqipx764m	cmb2xvddo0000czr3i311rrid	\N	109	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.474	2025-06-05 23:32:17.474
cmbk0h3us003jcz8p067fkx6k	cmb2xvddo0000czr3i311rrid	\N	110	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.476	2025-06-05 23:32:17.476
cmbk0h3q8000xcz8pyio2953m	cmb02r4rb0001cz1n2j6onvpx	\N	722	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.313	2025-06-06 00:05:12.168
cmbk0h3qb000zcz8pralusbj7	cmb02r4rb0001cz1n2j6onvpx	\N	723	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.315	2025-06-06 00:05:12.17
cmbk0h3qd0011cz8pb9b30xt0	cmb02r4rb0001cz1n2j6onvpx	\N	724	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.317	2025-06-06 00:05:12.172
cmbk0h3qg0013cz8pglnd4ec9	cmb02r4rb0001cz1n2j6onvpx	\N	725	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.32	2025-06-06 00:05:12.174
cmbk0h3qn0015cz8prwconigf	cmb033aeg0002cz1nqqiauyuf	\N	726	t		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.327	2025-06-06 00:05:12.176
cmbk0h3qq0017cz8p64uge2ux	cmb033aeg0002cz1nqqiauyuf	\N	727	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.33	2025-06-06 00:05:12.178
cmbk0h3qt0019cz8p2mgi29k9	cmb033aeg0002cz1nqqiauyuf	\N	728	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.333	2025-06-06 00:05:12.18
cmbk0h3qw001bcz8p3cq892qg	cmb033aeg0002cz1nqqiauyuf	\N	729	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.336	2025-06-06 00:05:12.183
cmbk0h3qy001dcz8p31cvy03v	cmb033aeg0002cz1nqqiauyuf	\N	730	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.338	2025-06-06 00:05:12.186
cmbk0h3r1001fcz8p5xgw51yh	cmb033aeg0002cz1nqqiauyuf	\N	731	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.341	2025-06-06 00:05:12.191
cmbk0h3r4001hcz8pjozxewwa	cmb033aeg0002cz1nqqiauyuf	\N	732	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.344	2025-06-06 00:05:12.193
cmbk0h3r6001jcz8pwiu2lw5k	cmb033aeg0002cz1nqqiauyuf	\N	733	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.346	2025-06-06 00:05:12.196
cmbk0h3r8001lcz8plkbnwz7j	cmb033aeg0002cz1nqqiauyuf	\N	734	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.348	2025-06-06 00:05:12.198
cmbk0h3rb001ncz8plucyfg9z	cmb033aeg0002cz1nqqiauyuf	\N	735	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.351	2025-06-06 00:05:12.2
cmbk0h3rl001pcz8p7p2pftbw	cmb04r17j0000czn9ih85qcjs	\N	736	t		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.361	2025-06-06 00:05:12.203
cmbk0h3rn001rcz8pxhquush5	cmb04r17j0000czn9ih85qcjs	\N	737	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.364	2025-06-06 00:05:12.223
cmbk0h3rq001tcz8pujnsmw4r	cmb04r17j0000czn9ih85qcjs	\N	738	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.366	2025-06-06 00:05:12.227
cmbk0h3rt001vcz8pj87n0tl2	cmb04r17j0000czn9ih85qcjs	\N	739	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.369	2025-06-06 00:05:12.229
cmbk0h3rw001xcz8p9yu0b5l3	cmb04r17j0000czn9ih85qcjs	\N	740	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.373	2025-06-06 00:05:12.23
cmbk0h3s0001zcz8pozxiof65	cmb04r17j0000czn9ih85qcjs	\N	741	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.376	2025-06-06 00:05:12.231
cmbk0h3s30021cz8pg66infpg	cmb04r17j0000czn9ih85qcjs	\N	742	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.379	2025-06-06 00:05:12.232
cmbk0h3s60023cz8pxkcslwfw	cmb04r17j0000czn9ih85qcjs	\N	743	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.382	2025-06-06 00:05:12.234
cmbk0h3s80025cz8p4xni64kb	cmb04r17j0000czn9ih85qcjs	\N	744	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.384	2025-06-06 00:05:12.235
cmbk0h3sb0027cz8p1fyy8ep6	cmb04r17j0000czn9ih85qcjs	\N	745	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.387	2025-06-06 00:05:12.238
cmbk0h3sl0029cz8p2pv4ty4q	cmb05d1m20000czzg6j8f4qnc	\N	746	t		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.397	2025-06-06 00:05:12.239
cmbk0h3sn002bcz8p0eo9jj2g	cmb05d1m20000czzg6j8f4qnc	\N	747	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.4	2025-06-06 00:05:12.241
cmbk0h3sq002dcz8pzr7sq8bd	cmb05d1m20000czzg6j8f4qnc	\N	748	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.402	2025-06-06 00:05:12.243
cmbk0h3ss002fcz8p0wcfx5t9	cmb05d1m20000czzg6j8f4qnc	\N	749	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.404	2025-06-06 00:05:12.245
cmbk0h3sv002hcz8p7w1i1y2x	cmb05d1m20000czzg6j8f4qnc	\N	750	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.407	2025-06-06 00:05:12.246
cmbk0h3t0002jcz8p2pmhmmin	cmb05d1m20000czzg6j8f4qnc	\N	751	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.412	2025-06-06 00:05:12.248
cmbk0h3t3002lcz8pk8z870g8	cmb05d1m20000czzg6j8f4qnc	\N	752	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.416	2025-06-06 00:05:12.249
cmbk0h3t6002ncz8ph7kmbcrs	cmb05d1m20000czzg6j8f4qnc	\N	753	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.418	2025-06-06 00:05:12.251
cmbk0h3t8002pcz8pi1wn1o3v	cmb05d1m20000czzg6j8f4qnc	\N	754	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.421	2025-06-06 00:05:12.253
cmbk0h3uv003lcz8p6cpcsl1v	cmb2xvddo0000czr3i311rrid	\N	111	f		0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.479	2025-06-05 23:32:17.479
cmbcwt6fm0001czaqnvrnuw2o	cmbcw65oh0000czofedd5gs8s	\N	112	t	http://localhost:3000/api/static/collections/cmbcw65oh0000czofedd5gs8s/a9919069-af9c-4771-88de-997eed994f0c-main-token-metadata-cmbcw65oh0000czofedd5gs8s.json	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	SUCCESS	f	\N	2025-06-01 00:15:18.995	2025-06-06 00:05:12.04
cmbk0h3q4000vcz8p1tp8h8qf	cmb02r4rb0001cz1n2j6onvpx	\N	721	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.308	2025-06-06 00:05:12.163
cmbk0h3ta002rcz8px297va6y	cmb05d1m20000czzg6j8f4qnc	\N	755	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.422	2025-06-06 00:05:12.254
cmbk0h3v3003ncz8p8t3s9fk2	cmaudx5h00000czso9u8uf330	\N	506	t		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.487	2025-06-06 00:05:12.257
cmbk0h3v7003pcz8ppwd0xisc	cmaudx5h00000czso9u8uf330	\N	507	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.491	2025-06-06 00:05:12.259
cmbk0h3vb003rcz8peebgafyw	cmaudx5h00000czso9u8uf330	\N	508	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.495	2025-06-06 00:05:12.261
cmbk0h3ve003tcz8pfaj4osue	cmaudx5h00000czso9u8uf330	\N	509	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.498	2025-06-06 00:05:12.264
cmbk0h3vg003vcz8px6t13vds	cmaudx5h00000czso9u8uf330	\N	510	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.501	2025-06-06 00:05:12.266
cmbk0h3vk003xcz8paxtbzmwh	cmaudx5h00000czso9u8uf330	\N	511	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.504	2025-06-06 00:05:12.267
cmbk0h3vn003zcz8pp6sboo61	cmaudx5h00000czso9u8uf330	\N	512	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.507	2025-06-06 00:05:12.269
cmbk0h3vr0041cz8pe1k7ntqs	cmaudx5h00000czso9u8uf330	\N	513	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.511	2025-06-06 00:05:12.273
cmbk0h3w30043cz8px60hcf4q	cmaudx5h00000czso9u8uf330	\N	514	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.523	2025-06-06 00:05:12.275
cmbk0h3w70045cz8pb18ridgn	cmaudx5h00000czso9u8uf330	\N	515	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.528	2025-06-06 00:05:12.277
cmbk0h3wh0047cz8pkfxq3489	cmaue9gdx0000cz4e0dpwkvu3	\N	606	t		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.537	2025-06-06 00:05:12.279
cmbk0h3wk0049cz8p3e399b1d	cmaue9gdx0000cz4e0dpwkvu3	\N	607	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.54	2025-06-06 00:05:12.281
cmbk0h3wn004bcz8pu1s07rtp	cmaue9gdx0000cz4e0dpwkvu3	\N	608	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.543	2025-06-06 00:05:12.283
cmbk0h3wp004dcz8pcgzs3qj0	cmaue9gdx0000cz4e0dpwkvu3	\N	609	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.546	2025-06-06 00:05:12.288
cmbk0h3ws004fcz8plae0nkph	cmaue9gdx0000cz4e0dpwkvu3	\N	610	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.549	2025-06-06 00:05:12.291
cmbk0h3wv004hcz8p5lzz08ar	cmaue9gdx0000cz4e0dpwkvu3	\N	611	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.552	2025-06-06 00:05:12.293
cmbk0h3wy004jcz8pl9yizp47	cmaue9gdx0000cz4e0dpwkvu3	\N	612	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.555	2025-06-06 00:05:12.295
cmbk0h3x1004lcz8p6fqbmpgx	cmaue9gdx0000cz4e0dpwkvu3	\N	613	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.557	2025-06-06 00:05:12.297
cmbk0h3x4004ncz8p0h8p58ak	cmaue9gdx0000cz4e0dpwkvu3	\N	614	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.56	2025-06-06 00:05:12.3
cmbk0h3x7004pcz8pnqdupwg5	cmaue9gdx0000cz4e0dpwkvu3	\N	615	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.563	2025-06-06 00:05:12.301
cmbk0h3xe004rcz8pu57jcscs	cmaueezs00000czlin4ppgmrv	\N	706	t		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.57	2025-06-06 00:05:12.303
cmbk0h3xh004tcz8pw34vylpl	cmaueezs00000czlin4ppgmrv	\N	707	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.573	2025-06-06 00:05:12.306
cmbk0h3xk004vcz8pcjf1c0dv	cmaueezs00000czlin4ppgmrv	\N	708	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.576	2025-06-06 00:05:12.308
cmbk0h3xn004xcz8p9k2srx8j	cmaueezs00000czlin4ppgmrv	\N	709	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.58	2025-06-06 00:05:12.31
cmbk0h3xq004zcz8pbikibc2l	cmaueezs00000czlin4ppgmrv	\N	710	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.582	2025-06-06 00:05:12.311
cmbk0h3xr0051cz8png56mi06	cmaueezs00000czlin4ppgmrv	\N	711	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.584	2025-06-06 00:05:12.313
cmbk0h3xt0053cz8pv7x3swg6	cmaueezs00000czlin4ppgmrv	\N	712	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.586	2025-06-06 00:05:12.315
cmbk0h3xv0055cz8p16jpjtyt	cmaueezs00000czlin4ppgmrv	\N	713	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.588	2025-06-06 00:05:12.317
cmbk0h3xy0057cz8pmhtpec9i	cmaueezs00000czlin4ppgmrv	\N	714	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.59	2025-06-06 00:05:12.319
cmbk0h3y10059cz8pf1n408fk	cmaueezs00000czlin4ppgmrv	\N	715	f		0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	COMPLETED	f	\N	2025-06-05 23:32:17.593	2025-06-06 00:05:12.321
\.


--
-- Data for Name: kyc_update_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kyc_update_requests (id, "userId", status, changes, "adminNotes", "createdAt", "updatedAt") FROM stdin;
cmalbhz7p0001cz21tuusg1ef	e2525983-7782-4407-acc2-11650349e3e0	APPROVED	{"city": "Lagos", "country": "Nigeria", "fullName": "xt GLITCH", "postalCode": "102103", "addressLine1": "22", "stateProvince": "Lagos"}	\N	2025-05-12 16:48:57.733	2025-05-27 00:10:11.266
cmao35mm90001czx45gdfuwti	e2525983-7782-4407-acc2-11650349e3e0	APPROVED	{"addressLine1": "22s", "addressLine2": "gffdgdf"}	\N	2025-05-14 15:18:43.138	2025-05-27 00:10:11.266
\.


--
-- Data for Name: land_listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.land_listings (id, "userId", title_deed_file_ref, "deedNumber", "deedType", "grantorName", "granteeName", "deedDate", title_cert_file_ref, "certNumber", cert_issue_date, legal_description, parcel_number, property_address, city, state, zip_code, country, latitude, longitude, property_type, property_area_sqm, property_description, listing_title, listing_price, price_currency, created_at, updated_at, mint_status, mint_error_reason, mint_timestamp, mint_transaction_hash, token_id, contract_address, collection_id, main_token_id, slug, cover_image_url, nft_description, nft_title, nft_image_file_ref, nft_collection_size, marketplace_listing_id, marketplace_listing_error, nft_image_irys_uri, nft_metadata_irys_uri, local_government_area, property_valuation, zoning_classification, child_tokens_base_url, collection_metadata_url, collection_nft_title, main_token_metadata_url, marketplace_transaction_hash, creator_address, rejection_reason, status) FROM stdin;
cmalj7jq80000cz25ojdhn126	e2525983-7782-4407-acc2-11650349e3e0	b9f878a0-8a03-4cda-be6a-7db679308692-images.jpeg	2222				\N	\N		\N	\N	2424242	\N	\N	Lagos	\N	Nigeria	1	1	\N	1	{"additionalInfo":{"ownerAddress":null,"files":{"surveyPlan":null,"encumbrance":null,"gis":null},"notes":""}}	Serene Hilltop plot #1	0.001	ETH	2025-05-12 20:24:48.033	2025-05-12 20:24:58.851	PENDING	\N	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	c57b152d-17d6-4c58-8690-c050c33ca772-images.jpeg	test	Serene Hilltop plot #1	c57b152d-17d6-4c58-8690-c050c33ca772-images.jpeg	100	\N	\N	placeholder-image-url	placeholder-metadata-uri	Ikorodu			\N	\N	\N	\N	\N	\N	\N	PENDING
cmaljbk150001cz25fyokuhs4	e2525983-7782-4407-acc2-11650349e3e0	\N	DEED-123	WARRANTY	John Doe	Jane Smith	\N	\N	\N	\N	Legal description of the property	12345	123 Main St	San Francisco	California	94105	USA	37.7749	-122.4194	RESIDENTIAL	1000	{"additionalInfo":null,"ownerEthAddress":null,"surveyPlanFileRef":null,"encumbranceFileRef":null,"gisFileRef":null,"notes":""}	Test NFT	0.1	ETH	2025-05-12 20:27:55.049	2025-05-12 20:27:55.049	NOT_STARTED	\N	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	6c9c628c-b184-4a79-bb28-cf41464b736b-sample-nft-image.jpg	This is a test NFT	Test NFT	6c9c628c-b184-4a79-bb28-cf41464b736b-sample-nft-image.jpg	\N	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmall1onh0000czamh1uhavdr	7e167862-4121-4e5c-8475-61a89195a6e7	\N	DEED-123	WARRANTY	John Doe	Jane Smith	\N	\N	\N	\N	Legal description of the property	12345	123 Main St	San Francisco	California	94105	USA	37.7749	-122.4194	RESIDENTIAL	1000	{"additionalInfo":null,"ownerEthAddress":null,"surveyPlanFileRef":null,"encumbranceFileRef":null,"gisFileRef":null,"notes":""}	Test NFT	0.1	ETH	2025-05-12 21:16:13.709	2025-05-12 21:16:13.709	NOT_STARTED	\N	\N	\N	\N	\N	\N	\N	\N	29148f8e-bb6d-403a-b3b6-a2d369d96f50-sample-nft-image.jpg	This is a test NFT	Test NFT	29148f8e-bb6d-403a-b3b6-a2d369d96f50-sample-nft-image.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmall94eu0001czammry1nkwg	e2525983-7782-4407-acc2-11650349e3e0	\N	DEED-123	WARRANTY	John Doe	Jane Smith	\N	\N	\N	\N	Legal description of the property	12345	123 Main St	San Francisco	California	94105	USA	37.7749	-122.4194	RESIDENTIAL	1000	{"additionalInfo":null,"ownerEthAddress":null,"surveyPlanFileRef":null,"encumbranceFileRef":null,"gisFileRef":null,"notes":""}	Test NFT	0.1	ETH	2025-05-12 21:22:00.726	2025-05-14 15:31:22.832	NOT_STARTED	\N	\N	\N	\N	\N	\N	\N	\N	473abbbf-3dbe-4a91-873c-f3d98e31cb8e-sample-nft-image.jpg	This is a test NFT	Test NFT	473abbbf-3dbe-4a91-873c-f3d98e31cb8e-sample-nft-image.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmaogfh120000cz1qy0xf52wk	e2525983-7782-4407-acc2-11650349e3e0	d8f4fedf-d716-458e-8f97-01b8d45b94e4-images.jpeg	1`				\N	\N		\N	\N	1	\N	\N	Lagos	\N	Nigeria	1	2	\N	2	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-14 21:30:17.463	2025-05-14 21:30:55.61	PENDING	\N	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	413af1f5-e06a-460e-a905-d67c6279f063-images.jpeg	\N	\N	\N	\N	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmaofvloq0000czdwz5f72b2c	e2525983-7782-4407-acc2-11650349e3e0	2c11f448-9fa3-467e-91ab-385fedf6d4a2-images.jpeg	2				\N	\N		\N	\N	2	\N	\N	Nairobi	\N	Kenya	1	1	\N	1	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-14 21:14:50.379	2025-05-14 21:30:59.236	FAILED	Failed to mint NFT	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	20e66fb4-5f58-4124-a8e6-c570b5ddaad0-images.jpeg	\N	\N	\N	\N	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmao6ax6x0000cznayr9zbcum	e2525983-7782-4407-acc2-11650349e3e0	f8fdeb7c-1bde-4960-ab6b-8861a9b13665-images (1).jpeg	2222				\N	\N		\N	\N	2424242	\N	\N	Lagos	\N	Nigeria	1	1	\N	1	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-14 16:46:48.969	2025-05-14 21:31:04.178	FAILED	Failed to mint NFT	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	f05bbd7b-abfc-41db-8e28-2c94f16d58a2-images (1).jpeg	\N	\N	\N	\N	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmaoh9x7j0000cz3ue1qs8qvi	e2525983-7782-4407-acc2-11650349e3e0	189fad26-18c2-490a-af69-b2f9b8ecec6d-Screenshot_20250502_012735.png	2222				\N	\N		\N	\N	1	\N	\N	Lagos	\N	Nigeria	24224242	2424422	\N	1.97	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-14 21:53:58.112	2025-05-14 21:54:25.737	PENDING	\N	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	52e462fa-0689-4433-97b7-0b12916caaac-images.jpeg	\N	\N	\N	\N	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmaohkx500000cz9l79f8rfb1	e2525983-7782-4407-acc2-11650349e3e0	ce032b19-28e4-41e4-8af8-ae38adf7d2c2-images (1).jpeg	2				\N	\N		\N	\N	2	\N	\N	Lagos	\N	Nigeria	2	2	\N	2	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-14 22:02:31.237	2025-05-14 22:04:01.944	COMPLETED	\N	\N	0xff4d70dcaceca37e0398c8c6751e2df9ebda6e33869100431cec6cd8822555b2	4	\N	\N	\N	\N	/uploads/b275c989-b63b-4ca8-8f42-1a501d7e2a89-nft-image-cmaohkx500000cz9l79f8rfb1.jpeg	\N	\N	\N	\N	4	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmaoi8v8y0000czflwripvzpf	e2525983-7782-4407-acc2-11650349e3e0	caeb82c5-d448-4fc7-9bb2-9302ce2a8e86-images.jpeg	2222				\N	\N		\N	\N	2424242	\N	\N	Abuja FCT	\N	Nigeria	2	2	\N	2	{"nftDescription":"TEST","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-14 22:21:08.53	2025-05-14 22:21:38.724	PENDING	\N	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	03160ca1-27e2-4354-bd93-cc5fd9e05bb4-dexscreener.com_NOODLE_SOL_2025-05-13_19-53-58.png	\N	\N	\N	\N	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmaojkq4j0000czf4x3t04ysl	e2525983-7782-4407-acc2-11650349e3e0	a253204c-3ee9-4cae-abe4-ce1f746c6f02-Screenshot_20250502_012847.png	1				\N	\N		\N	\N	1	\N	\N	Lagos	\N	Nigeria	1	1	\N	1	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	test	0.0001	ETH	2025-05-14 22:58:21.379	2025-05-14 23:07:34.915	FAILED	Failed to mint NFT	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	0b2bb8e1-2502-40c9-8d7c-1458ad576b7d-images.jpeg	\N	\N	\N	\N	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmaolks2w0000czvji5r416np	e2525983-7782-4407-acc2-11650349e3e0	15b8e5ea-aab8-4370-a9b7-40cf66606a0b-images.jpeg	2				\N	\N		\N	\N	2	\N	\N	Lagos	\N	Nigeria	1	2424422	\N	2	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-14 23:54:23.144	2025-05-14 23:54:47.876	PENDING	\N	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	9960a0f5-6005-4f29-9cac-0301b8977493-images.jpeg	\N	\N	\N	\N	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmaomqy2r0000czjvpr0r19qu	e2525983-7782-4407-acc2-11650349e3e0	fe23b063-2d90-4c3b-a5e2-910dd61748a0-images (1).jpeg	5				\N	\N		\N	\N	3	\N	\N	Lagos	\N	Nigeria	24224242	3	\N	1	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	1e-07	ETH	2025-05-15 00:27:10.467	2025-05-15 00:27:39.167	NOT_STARTED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmaqin0v60000cz8e1gpht44f	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-16 08:07:41.346	2025-05-16 08:07:49.366	FAILED	Failed to mint NFT	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	34f7d383-5c08-4a6e-8929-7ddc9c6dc093-images.jpeg	\N	\N	\N	\N	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmarhqm0f0000czcu43k3n2b4	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"etst","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-17 00:30:15.279	2025-05-17 00:30:38.152	FAILED	Failed to mint NFT	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	2b23257f-b858-4640-80c1-7c0735d9126a-images.jpeg	\N	\N	\N	\N	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmarmvege0000cz9yerprhes9	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"ets","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-17 02:53:56.846	2025-05-17 02:57:30.828	COMPLETED	\N	\N	0x8d48b2d67247b0a36af64b90f8eddfefd76a4b37cd4b46c455a5cfcc6e43e71a	1	\N	\N	\N	\N	/uploads/ed59387a-ece9-4869-ab70-137bdc2845de-nft-image-cmarmvege0000cz9yerprhes9.jpeg	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmarngfjd0001cz9ypkqe6v7b	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-17 03:10:18.026	2025-05-17 03:11:05.217	COMPLETED	\N	\N	0x4ffb9d19da2e8648ad4a0c19a05a19dce5dfbe2320c245bea81c34311b8e5a9e	2	\N	\N	\N	\N	/uploads/bf9a7e3a-b9db-4982-bf78-ad31aca4012c-nft-image-cmarngfjd0001cz9ypkqe6v7b.jpeg	\N	\N	\N	\N	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmariljwc0000cz4ju2bcmn6h	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-17 00:54:18.876	2025-05-31 20:34:20.755	COMPLETED	\N	\N	0xf0f2aca1dc23bdd081440c900072e4863a627cf11e7b3515fe470f194c97252b	5	\N	\N	\N	\N	/uploads/5e3cbef1-5d66-48b0-a7f9-475768faa6e5-nft-image-cmariljwc0000cz4ju2bcmn6h.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmbilzsjl0000czzpnmbke17t	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	Zularich Garden 2.0 (5000 sqm for 10 plots)	1e-05	ETH	2025-06-04 23:59:08.865	2025-06-05 00:00:14.295	COMPLETED_COLLECTION	\N	2025-06-04 23:59:30.134	0x734fdbd7546b3fcde7439dd8b799ef87d71aa799874d781a09321c7d829b7170	\N	0x8447dEe42d0cbBa5fa7DE617a3983Eb2da1d7Dde	2	10	\N	/uploads/collections/cmbilzsjl0000czzpnmbke17t/72ae2af5-17ee-4bd8-ac7c-1686d6118a6e-main-token-image-cmbilzsjl0000czzpnmbke17t.jpeg	Zularich Gardens 2.0 is a classy and sophisticated Land space, its born out of the desire for perfect and Luxurious lifestyle, yet pocket friendly. Sqm: 5000	Zularich Garden 2.0 (5000 sqm for 10 plots)	d5e30016-3fc4-4f25-9743-db4e4318eee1-gardedn.jpeg	10	\N	transaction execution reverted (action="sendTransaction", data=null, reason=null, invocation=null, revert=null, transaction={ "data": "", "from": "0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07", "to": "0xfAE9Ef51fea4D220cD427EC47C8dFDA4a6426De8" }, receipt={ "_type": "TransactionReceipt", "blobGasPrice": null, "blobGasUsed": null, "blockHash": "0x586bd366a8fa8c6df4c16f1c262ab0159733aad4eabdca0aef503b0dd19b269c", "blockNumber": 8478534, "contractAddress": null, "cumulativeGasUsed": "16623610", "from": "0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07", "gasPrice": "1000010", "gasUsed": "79744", "hash": "0xd56ada7083d37a73faa8ee872b1e8142f78e40213a54733c97e499c56ce99530", "index": 152, "logs": [  ], "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "root": null, "status": 0, "to": "0xfAE9Ef51fea4D220cD427EC47C8dFDA4a6426De8" }, code=CALL_EXCEPTION, version=6.14.1)	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://fd26-197-210-77-85.ngrok-free.app/api/static/collections/cmbilzsjl0000czzpnmbke17t/child-tokens/	https://fd26-197-210-77-85.ngrok-free.app/uploads/collections/cmbilzsjl0000czzpnmbke17t/43e23b3d-c647-4b44-938e-92de5de566e3-collection-metadata-cmbilzsjl0000czzpnmbke17t.json	Zularich Garden 2.0 (5000 sqm for 10 plots)	https://fd26-197-210-77-85.ngrok-free.app/uploads/collections/cmbilzsjl0000czzpnmbke17t/8ff12893-8994-4119-9b63-52451505c0b5-main-token-metadata-cmbilzsjl0000czzpnmbke17t.json	\N	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	PENDING
cmb05d1m20000czzg6j8f4qnc	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	BLEEEEEHHHH	1e-05	ETH	2025-05-23 01:53:42.506	2025-05-31 20:34:20.755	COMPLETED_COLLECTION	\N	2025-05-23 01:54:01.952	0x2ca4bcd25f9a032d8a99c4bf46316d668d019c6ec31dfb12b9bb86d1f4ac3ec3	\N	0x155e70f694E645907d36583Cca893BE52bf3A29f	13	746	\N	/uploads/collections/cmb05d1m20000czzg6j8f4qnc/93ece2f6-6e52-42a5-ba10-a0d1fbcb0d93-main-token-image-cmb05d1m20000czzg6j8f4qnc.png	ets	\N	81c66056-82cf-4533-b3ba-a16d073fd766-images.jpeg	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://a199-102-91-4-208.ngrok-free.app/api/static/collections/cmb05d1m20000czzg6j8f4qnc/child-tokens/	https://a199-102-91-4-208.ngrok-free.app/uploads/collections/cmb05d1m20000czzg6j8f4qnc/504e01cd-529d-4174-8816-a3ff7a67f8cf-collection-metadata-cmb05d1m20000czzg6j8f4qnc.json	BLEEEEEHHHH	https://a199-102-91-4-208.ngrok-free.app/uploads/collections/cmb05d1m20000czzg6j8f4qnc/0b3ba534-11eb-48cf-86be-fca3835d5c21-main-token-metadata-cmb05d1m20000czzg6j8f4qnc.json	\N	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	PENDING
cmalj5lfu0000cz5j93qxj06t	e2525983-7782-4407-acc2-11650349e3e0	\N	DEED-123	WARRANTY	John Doe	Jane Smith	\N	\N	\N	\N	Legal description of the property	12345	123 Main St	San Francisco	California	94105	USA	37.7749	-122.4194	RESIDENTIAL	1000	{"additionalInfo":{"ownerAddress":null,"files":{"surveyPlan":null,"encumbrance":null,"gis":null},"notes":""}}	Test NFT	0.1	ETH	2025-05-12 20:23:16.938	2025-06-24 22:53:16.306	COMPLETED	\N	\N	0x66eaa27f5cf789901f86a4982d83c36e074239ade15bec052c1c703d64cac40d	4	\N	\N	\N	\N	/uploads/bfb349f4-fa01-4492-9375-d8694b254a5f-nft-image-cmalj5lfu0000cz5j93qxj06t.png	This is a test NFT	Test NFT	c2328e7e-92c5-4496-84b9-bc34f62c992c-sample-nft-image.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	u	REJECTED
cmaudax5q0000czcrxc2328sr	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-19 00:49:23.295	2025-05-31 19:10:52.526	PENDING_COLLECTION	\N	2025-05-19 00:49:50.512	0xcf96854245d886a8181737d55b06548fa456e35f96198a85c660e2f9ff52f014	\N	0x155e70f694E645907d36583Cca893BE52bf3A29f	4	206	\N	c4379cd8-362f-459d-817d-21298ad70e50-images (1).jpeg	\N	\N	81c66056-82cf-4533-b3ba-a16d073fd766-images.jpeg	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmauc49wa0000czvmcabjn2rr	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"rea","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-19 00:16:13.594	2025-05-19 00:36:06.961	FAILED_COLLECTION	Failed to mint collection	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	a38c1bf4-3160-4418-be7a-6a5e4c23fab7-images.jpeg	\N	\N	\N	\N	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmaudkbcy0000czeb4val9y4g	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"tess","notes":"","evmOwnerAddress":null}	test	0.0001	ETH	2025-05-19 00:56:41.602	2025-05-31 19:10:52.528	FAILED	\nInvalid `prisma.landListing.update()` invocation:\n\n{\n  where: {\n    id: "cmaudkbcy0000czeb4val9y4g"\n  },\n  data: {\n    mintStatus: "COMPLETED",\n    mintTransactionHash: "0x377f27e6b5278d7feac87bddf18b3bab7d96a1f9514f44032aec0adba7588e7c",\n    tokenId: 406,\n    collectionId: 6,\n                  ~\n    nftTitle: "tset",\n    nftDescription: "test",\n    nftImageFileRef: "/uploads/01c42d9e-99e8-4121-b751-c57f4b7c999f-nft-image-cmaudkbcy0000czeb4val9y4g.jpeg",\n    metadataUri: "https://a1ea-185-107-56-151.ngrok-free.app/uploads/92a792eb-dbeb-4327-a991-a42ce08e78db-main-nft-metadata-cmaudkbcy0000czeb4val9y4g.json"\n  }\n}\n\nArgument `collectionId`: Invalid value provided. Expected String, NullableStringFieldUpdateOperationsInput or Null, provided Int.	2025-05-19 00:57:28.674	0x377f27e6b5278d7feac87bddf18b3bab7d96a1f9514f44032aec0adba7588e7c	\N	0x155e70f694E645907d36583Cca893BE52bf3A29f	6	406	\N	58e323da-988f-47e5-9512-387772724f95-images (1).jpeg	\N	\N	81c66056-82cf-4533-b3ba-a16d073fd766-images.jpeg	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmaudx5h00000czso9u8uf330	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-19 01:06:40.501	2025-05-31 19:10:52.522	COMPLETED	\N	2025-05-19 01:07:03.583	0x808c903264284db1a11b1b6826a6102d42db2d6a7bc2896313a3b76123b78fc7	\N	0x155e70f694E645907d36583Cca893BE52bf3A29f	7	506	\N	c2ceabcb-9612-4a7d-89d2-4bda113b2f48-images.jpeg	\N	\N	81c66056-82cf-4533-b3ba-a16d073fd766-images.jpeg	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	PENDING
cmampepg70004czprx6ii4bh4	e2525983-7782-4407-acc2-11650349e3e0	b2d1b1d3-9930-441f-a082-762ec12a2949-images.jpeg	2222				\N	\N		\N	\N	2424242	\N	\N	Lagos	\N	Nigeria	1	1	\N	0.97	{"nftDescription":"retste","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-13 16:06:05.911	2025-05-31 20:34:20.755	COMPLETED	\N	\N	0x78981346824105ef407a4a1cce9b6cd8c538fa21e4f8377ad33394ecbe891a74	3	\N	\N	\N	\N	/uploads/6dff1176-2f87-414d-9b43-310f3f08805e-nft-image-cmampepg70004czprx6ii4bh4.jpeg	\N	Serene Hilltop plot #1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmb02gubf0000cz1n28jr80hy	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"CUSTOM DESCRIPTION","notes":"","evmOwnerAddress":null}	BLEEEEEHHHH	0.0001	ETH	2025-05-23 00:32:40.827	2025-05-23 00:32:40.827	NOT_STARTED	\N	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	479aee63-9500-4530-80f2-d5e2bf4da827-Screenshot_20250502_012735.png	\N	\N	\N	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmb26zfdd0000czc2zu5ajz5u	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-24 12:14:38.738	2025-05-24 12:15:05.02	FAILED_COLLECTION	Failed to mint collection	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	97668ab4-34fc-46c6-b8bf-a5c946957934-images.jpeg	test	\N	\N	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmb2etmsf0000czq3gatc82s8	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-24 15:54:05.343	2025-05-24 16:15:03.932	FAILED_COLLECTION	Failed to mint collection	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	69fbc8d5-08e6-4399-9aac-20f2662b2f91-images (1).jpeg	test	\N	\N	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmb2vs6ua0000czh9q8ff2z1f	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-24 23:48:51.491	2025-05-24 23:49:05.653	FAILED_COLLECTION	Failed to mint collection	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	c1362c7c-2dbf-48c5-a367-d998a43d5116-images (1).jpeg	test	\N	\N	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmb033aeg0002cz1nqqiauyuf	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"estst","notes":"","evmOwnerAddress":null}	BLEEEEEHHHH	0.0001	ETH	2025-05-23 00:50:08.105	2025-05-31 20:34:20.755	COMPLETED_COLLECTION	\N	2025-05-23 00:50:38.895	0x693d463521989920c3cc2a55c1d73ca8502f9f664b32bc209726925fbaf97b61	\N	0x155e70f694E645907d36583Cca893BE52bf3A29f	11	726	\N	/uploads/collections/cmb033aeg0002cz1nqqiauyuf/8737d32b-06be-4c86-aa79-641d83edbe0b-main-token-image-cmb033aeg0002cz1nqqiauyuf.png	\N	\N	81c66056-82cf-4533-b3ba-a16d073fd766-images.jpeg	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://15af-102-91-4-208.ngrok-free.app/api/static/collections/cmb033aeg0002cz1nqqiauyuf/child-tokens/	https://15af-102-91-4-208.ngrok-free.app/uploads/collections/cmb033aeg0002cz1nqqiauyuf/6d2f3ed1-2016-439a-a2c3-c99aec3b70b1-collection-metadata-cmb033aeg0002cz1nqqiauyuf.json	BLEEEEEHHHH	https://15af-102-91-4-208.ngrok-free.app/uploads/collections/cmb033aeg0002cz1nqqiauyuf/ae158c90-225b-457d-ba20-d3934a8adf6c-main-token-metadata-cmb033aeg0002cz1nqqiauyuf.json	\N	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	PENDING
cmb04r17j0000czn9ih85qcjs	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"sfsfs","notes":"","evmOwnerAddress":null}	fsfsfa	0.0001	ETH	2025-05-23 01:36:35.551	2025-05-31 20:34:20.755	COMPLETED_COLLECTION	\N	2025-05-23 01:36:52.855	0xcc02e11ba538577e606c50cbed0d97b1ba477f523752d5149e01faf2d0433203	\N	0x155e70f694E645907d36583Cca893BE52bf3A29f	12	736	\N	/uploads/collections/cmb04r17j0000czn9ih85qcjs/3dc1be71-6a99-4fe3-a617-beb52f2a5fba-main-token-image-cmb04r17j0000czn9ih85qcjs.jpeg	\N	\N	81c66056-82cf-4533-b3ba-a16d073fd766-images.jpeg	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://42cd-102-91-4-208.ngrok-free.app/api/static/collections/cmb04r17j0000czn9ih85qcjs/child-tokens/	https://42cd-102-91-4-208.ngrok-free.app/uploads/collections/cmb04r17j0000czn9ih85qcjs/384a58ab-fd63-4c0e-b586-c7e89f2419c2-collection-metadata-cmb04r17j0000czn9ih85qcjs.json	fsfsfa	https://42cd-102-91-4-208.ngrok-free.app/uploads/collections/cmb04r17j0000czn9ih85qcjs/fc63220d-8efa-4f2f-9440-3d95f04a90c7-main-token-metadata-cmb04r17j0000czn9ih85qcjs.json	\N	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	PENDING
cmb26bpgb0000czaujc5x15fq	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-24 11:56:12.059	2025-05-24 11:57:35.109	PENDING_COLLECTION	Failed to mint collection	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	70ab2a64-18b7-4b73-b30a-64b552ab471b-images.jpeg	test	\N	\N	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmb26kv6e0000cz3g3qif1axr	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	test	0.0001	ETH	2025-05-24 12:03:19.382	2025-05-24 12:03:40.858	FAILED_COLLECTION	Failed to mint collection	\N	ethereum-placeholder-address	\N	\N	\N	\N	\N	9b522cda-5363-41f9-a942-af259e7239cb-images.jpeg	test	\N	\N	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmallprvt0000cze0uh50svtk	e2525983-7782-4407-acc2-11650349e3e0	2beb9f56-7220-4d4e-9c46-b56fc58325dd-images.jpeg	2222				\N	\N		\N	\N	2424242	\N	\N	Abuja FCT	\N	Nigeria	1	1	\N	1	{"additionalInfo":null,"ownerEthAddress":null,"surveyPlanFileRef":null,"encumbranceFileRef":null,"gisFileRef":null,"notes":""}	Serene Hilltop plot #1	0.001	ETH	2025-05-12 21:34:57.641	2025-05-31 20:34:20.755	COMPLETED	Failed to mint NFT	\N	0xbf440df8a4c8ab3aa1aa8ddf70666383952a59b7a64d32ea124127d6263446bb	2	\N	\N	\N	\N	/uploads/3091983c-d2cb-49cb-be37-4a32da7600b1-nft-image-cmallprvt0000cze0uh50svtk.jpeg	test	Serene Hilltop plot #1	c3528236-3b7b-42af-bfe8-1ab69ce113c7-images (1).jpeg	100	\N	\N	\N	\N	Abaji			\N	\N	\N	\N	\N	\N	\N	PENDING
cmaogxzeb0000czced61pp6ux	e2525983-7782-4407-acc2-11650349e3e0	17cc9cb3-a6db-420c-8247-f38fc6aa2a4c-images.jpeg	1				\N	\N		\N	\N	2	\N	\N	Lagos	\N	Nigeria	1	1	\N	1	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	-2.9999	ETH	2025-05-14 21:44:41.075	2025-05-31 20:34:20.755	COMPLETED	\N	\N	0x9639f341cc33247aa43d91e679ce0ff4a8ec8b54ff464829800deaa189be9eb4	2	\N	\N	\N	\N	/uploads/45f20552-9eb0-4e98-9c0a-0838df88947d-nft-image-cmaogxzeb0000czced61pp6ux.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmarm78jy0000cz47hgzxiaox	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"s","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.001	ETH	2025-05-17 02:35:09.454	2025-05-31 20:34:20.755	COMPLETED	\N	\N	0x8c97d2e90b8b519f27f6bfd450c9967f60a62545dbfaad53d142ba6187e70066	0	\N	\N	\N	\N	/uploads/07d1e5bc-2de2-4536-9968-13c56adb088a-nft-image-cmarm78jy0000cz47hgzxiaox.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmaokzvhz0000czp71v0va2xd	e2525983-7782-4407-acc2-11650349e3e0	2bc04699-14a0-4eb4-ad24-d5aa54f5b72e-images.jpeg	1				\N	\N		\N	\N	2	\N	\N	Gauteng	\N	South Africa	1	1	\N	1	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-14 23:38:07.8	2025-05-31 20:34:20.755	COMPLETED	\N	\N	0x1c4cb4f7db3f105970c6370a6d4c5476d528b9663a761d13bfdf69a7e632032f	6	\N	\N	\N	\N	/uploads/18cc6ef0-1f85-4003-81fc-579e9b27864f-nft-image-cmaokzvhz0000czp71v0va2xd.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmapokk900000czew4txyjvmv	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-15 18:05:58.02	2025-05-31 20:34:20.755	COMPLETED	\N	\N	0xa3cda0ac49a7218ba07042142f0bd1aeaaea6f53fa2587641d4ad6e8cd2b94e4	8	\N	\N	\N	\N	/uploads/3e9c07eb-7843-4d0a-a38e-9698c61504ea-nft-image-cmapokk900000czew4txyjvmv.png	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmarhu1n90000czby1066eqze	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"tests","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-17 00:32:55.509	2025-05-31 20:34:20.755	COMPLETED	\N	\N	0x2db22e80bce5199f2cd8459ee6d1b8e5c8e9d3d9a75bc82abdcab19d0b28dc50	1	\N	\N	\N	\N	/uploads/ec586c90-b184-485e-bd12-ea010887dc4d-nft-image-cmarhu1n90000czby1066eqze.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmarhxx4c0000czntp31tkk8d	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-17 00:35:56.269	2025-05-31 20:34:20.755	COMPLETED	\N	\N	0xcfd83325466fdacb69ba1e7219453a08f2b737a0cdb69ce2ae5b75e38717c136	2	\N	\N	\N	\N	/uploads/192031c4-0963-4387-b9c0-969c3862b260-nft-image-cmarhxx4c0000czntp31tkk8d.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmarib4wr0000czzf5kzocxo2	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-17 00:46:12.892	2025-05-31 20:34:20.755	COMPLETED	\N	\N	0x07a6e73b908a8dba42ab786a9e949b284a52ebfa285e1d728c6dae8ae497b6c9	3	\N	\N	\N	\N	/uploads/074acb00-5a0e-44ef-89ac-67926d079578-nft-image-cmarib4wr0000czzf5kzocxo2.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmarihgrr0000czxdk7tbfh9a	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"test","notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.001	ETH	2025-05-17 00:51:08.2	2025-05-31 20:34:20.755	COMPLETED	\N	\N	0xc3daecec4a8406e293a3d084bedd8a3a6b092ca34de85c01cc69b1d3b6a4af7d	4	\N	\N	\N	\N	/uploads/75a25f23-3e5e-4029-b7ca-87f580fbef65-nft-image-cmarihgrr0000czxdk7tbfh9a.jpeg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	PENDING
cmbil2r2w0000czkpsf43ah2o	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	Amen Estate Phase 3	1e-05	ETH	2025-06-04 23:33:27.32	2025-06-04 23:35:04.439	COMPLETED_COLLECTION	\N	2025-06-04 23:34:09.345	0x912c33afe22d81c12bbe1ad362cbd6acb23ca21bc9ac388aa7169466f2fa90ed	\N	0x8447dEe42d0cbBa5fa7DE617a3983Eb2da1d7Dde	1	0	\N	/uploads/collections/cmbil2r2w0000czkpsf43ah2o/eaf242b9-8016-4f02-ade6-94e3f3f0e08d-main-token-image-cmbil2r2w0000czkpsf43ah2o.jpeg	Amen Estate Phase 3 continues the tradition of luxury and innovation with a focus on modern living. Lands can be used for residential purposes. Nestled in a prime location, it boasts modern facilities that offer comfort, elegance, and convenience. With spacious layouts and top-tier amenities, it's the perfect choice for those seeking a serene lifestyle.	Amen Estate Phase 3	6a0a5fe8-6048-459c-9509-3303af795fa5-property-6835e848c66707000de857cd-1748363499694-cover.jpeg	10	\N	transaction execution reverted (action="sendTransaction", data=null, reason=null, invocation=null, revert=null, transaction={ "data": "", "from": "0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07", "to": "0xfAE9Ef51fea4D220cD427EC47C8dFDA4a6426De8" }, receipt={ "_type": "TransactionReceipt", "blobGasPrice": null, "blobGasUsed": null, "blockHash": "0x1370ceb176a19d255bf3c60b6fbb0dd2634774840adea4d69edee7f5333fa18f", "blockNumber": 8478408, "contractAddress": null, "cumulativeGasUsed": "6834941", "from": "0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07", "gasPrice": "1000013", "gasUsed": "51469", "hash": "0x82d280356eaeeb123255f52d9c7fef57bb8bd86e245c655f07bb2d03d681f923", "index": 66, "logs": [  ], "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "root": null, "status": 0, "to": "0xfAE9Ef51fea4D220cD427EC47C8dFDA4a6426De8" }, code=CALL_EXCEPTION, version=6.14.1)	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://93bc-197-210-77-85.ngrok-free.app/api/static/collections/cmbil2r2w0000czkpsf43ah2o/child-tokens/	https://93bc-197-210-77-85.ngrok-free.app/uploads/collections/cmbil2r2w0000czkpsf43ah2o/737f5781-132a-43be-a061-837cea230601-collection-metadata-cmbil2r2w0000czkpsf43ah2o.json	Amen Estate Phase 3	https://93bc-197-210-77-85.ngrok-free.app/uploads/collections/cmbil2r2w0000czkpsf43ah2o/86174372-78f7-412b-b475-bdd2d3d2e139-main-token-metadata-cmbil2r2w0000czkpsf43ah2o.json	\N	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	PENDING
cmbsig6l70000czc58pcdjwnp	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	Green Ark Estate	1e-05	ETH	2025-06-11 22:17:36.859	2025-06-11 22:21:45.278	COMPLETED_COLLECTION	\N	2025-06-11 22:18:55.678	0xe1c24ccf95feeda67d1a2216fdea896c3c684efa74bd73d2f69fe8537c621a1b	\N	0x8447dEe42d0cbBa5fa7DE617a3983Eb2da1d7Dde	3	20	\N	/uploads/collections/cmbsig6l70000czc58pcdjwnp/1e550988-650f-47db-8b48-e271b7fad7e0-main-token-image-cmbsig6l70000czc58pcdjwnp.jpeg	Introducing Green Ark Estate — strategically located Opposite Chevron Drive, this is your golden chance to secure land in a fully developed, high-demand neighborhood.	Green Ark Estate	a1654857-f2ca-49af-849a-d12b5033654d-greenark.jpeg	10	\N	transaction execution reverted (action="sendTransaction", data=null, reason=null, invocation=null, revert=null, transaction={ "data": "", "from": "0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07", "to": "0xfAE9Ef51fea4D220cD427EC47C8dFDA4a6426De8" }, receipt={ "_type": "TransactionReceipt", "blobGasPrice": null, "blobGasUsed": null, "blockHash": "0x2250c9556eb7615a6dfc2c45913419ee12057da512922bea5da4de2967ef0735", "blockNumber": 8528356, "contractAddress": null, "cumulativeGasUsed": "13345606", "from": "0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07", "gasPrice": "1704725", "gasUsed": "79744", "hash": "0x575a9b9748c358d10ae0b025ecaeed86deae5125e25804481099b3f9f5cf6baa", "index": 109, "logs": [  ], "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "root": null, "status": 0, "to": "0xfAE9Ef51fea4D220cD427EC47C8dFDA4a6426De8" }, code=CALL_EXCEPTION, version=6.14.1)	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://2b05-197-210-71-194.ngrok-free.app/api/static/collections/cmbsig6l70000czc58pcdjwnp/child-tokens/	https://2b05-197-210-71-194.ngrok-free.app/uploads/collections/cmbsig6l70000czc58pcdjwnp/870c4507-bbb6-4ce8-b5e6-3324a7c1ebcd-collection-metadata-cmbsig6l70000czc58pcdjwnp.json	Green Ark Estate	https://2b05-197-210-71-194.ngrok-free.app/uploads/collections/cmbsig6l70000czc58pcdjwnp/ff119820-f6a4-45e6-b8b5-cd5779d23803-main-token-metadata-cmbsig6l70000czc58pcdjwnp.json	\N	\N	\N	PENDING
cmb2wcefj0000czlrzwoxaitp	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	Serene Hilltop plot #1	0.0001	ETH	2025-05-25 00:04:34.447	2025-05-31 20:34:20.755	COMPLETED_COLLECTION	Failed to mint collection	2025-05-25 00:22:02.831	0xfc1a9759bd7252d8fe5d07a099f5c70b9d01eecc5d9ff10d7e40bf15072a20cd	\N	0x837527fa3206Adcba2a8909CAE39280D606540c4	15	92	\N	/uploads/collections/cmb2wcefj0000czlrzwoxaitp/38b33fc2-306d-449b-9def-c794b6383917-main-token-image-cmb2wcefj0000czlrzwoxaitp.jpeg	rwar	\N	81c66056-82cf-4533-b3ba-a16d073fd766-images.jpeg	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://172d-194-59-6-64.ngrok-free.app/api/static/collections/cmb2wcefj0000czlrzwoxaitp/child-tokens/	https://172d-194-59-6-64.ngrok-free.app/uploads/collections/cmb2wcefj0000czlrzwoxaitp/cc197940-ee66-4d71-a7dc-c296acefee4a-collection-metadata-cmb2wcefj0000czlrzwoxaitp.json	Serene Hilltop plot #1	https://172d-194-59-6-64.ngrok-free.app/uploads/collections/cmb2wcefj0000czlrzwoxaitp/91d523b3-0987-4967-b35d-5df268029fbf-main-token-metadata-cmb2wcefj0000czlrzwoxaitp.json	\N	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	PENDING
cmbyh8wiy0000cz4d0egp3l29	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	Okun Mopo, Okun Ajah, Akah Lagos.	0.001	ETH	2025-06-16 02:30:34.666	2025-06-16 02:36:41.066	COMPLETED_COLLECTION	Failed to mint collection	2025-06-16 02:35:41.23	0x58e19ad7d56e3296486491131ca5e2048878ff6fd76595a7227125353439492e	\N	0x8447dEe42d0cbBa5fa7DE617a3983Eb2da1d7Dde	5	40	\N	/uploads/collections/cmbyh8wiy0000cz4d0egp3l29/b44facdd-5eeb-4357-8356-e5b8292d8a08-main-token-image-cmbyh8wiy0000cz4d0egp3l29.webp	A 40ft x 120ft land size half plot\r\nWith Survey and Family receipt \r\nAt Okun Mopo, Okun Ajah, Akah Lagos. \r\nClose to Baracuda Beach \r\nSelling price: N10 million asking	Okun Mopo, Okun Ajah, Akah Lagos.	9dc70704-2889-4d56-9425-516fc59e7b37-147145424_MTUwMC0xMTI1LTZiZWIzN2EwOWM.webp	10	\N	transaction execution reverted (action="sendTransaction", data=null, reason=null, invocation=null, revert=null, transaction={ "data": "", "from": "0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07", "to": "0xfAE9Ef51fea4D220cD427EC47C8dFDA4a6426De8" }, receipt={ "_type": "TransactionReceipt", "blobGasPrice": null, "blobGasUsed": null, "blockHash": "0xa72ad13e8364e7f863024373dbcd3cd76273c1b21c5e33441eddca46ad52464e", "blockNumber": 8558384, "contractAddress": null, "cumulativeGasUsed": "10255694", "from": "0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07", "gasPrice": "1000009", "gasUsed": "79756", "hash": "0x9105512f0b2bfe79bcb77b5de46170e28b95b26eb2a46181c2e09d124acb48ac", "index": 98, "logs": [  ], "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "root": null, "status": 0, "to": "0xfAE9Ef51fea4D220cD427EC47C8dFDA4a6426De8" }, code=CALL_EXCEPTION, version=6.14.1)	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://e426-197-210-71-57.ngrok-free.app/api/static/collections/cmbyh8wiy0000cz4d0egp3l29/child-tokens/	https://e426-197-210-71-57.ngrok-free.app/uploads/collections/cmbyh8wiy0000cz4d0egp3l29/f9f95dbb-8ac3-4d54-9a5b-5119f10cbb54-collection-metadata-cmbyh8wiy0000cz4d0egp3l29.json	Okun Mopo, Okun Ajah, Akah Lagos.	https://e426-197-210-71-57.ngrok-free.app/uploads/collections/cmbyh8wiy0000cz4d0egp3l29/fe800939-45fa-4fa9-beab-dfbdaab032e7-main-token-metadata-cmbyh8wiy0000cz4d0egp3l29.json	\N	\N	\N	PENDING
cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	teststsststs	0.0001	ETH	2025-05-25 00:47:19.165	2025-05-31 20:34:20.755	COMPLETED_COLLECTION	\N	2025-05-25 00:47:38.752	0x552ac31009c112a373c25ed0300fb3da9a93f8a9fb502e6ac4da476c6b7235df	\N	0x837527fa3206Adcba2a8909CAE39280D606540c4	16	102	\N	/uploads/collections/cmb2xvddo0000czr3i311rrid/a6022470-67a7-4bea-b343-3ccf06cbade1-main-token-image-cmb2xvddo0000czr3i311rrid.jpeg	tets	\N	81c66056-82cf-4533-b3ba-a16d073fd766-images.jpeg	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://172d-194-59-6-64.ngrok-free.app/api/static/collections/cmb2xvddo0000czr3i311rrid/child-tokens/	https://172d-194-59-6-64.ngrok-free.app/uploads/collections/cmb2xvddo0000czr3i311rrid/803c6571-c997-429a-a0d8-1bf54e18e6e1-collection-metadata-cmb2xvddo0000czr3i311rrid.json	teststsststs	https://172d-194-59-6-64.ngrok-free.app/uploads/collections/cmb2xvddo0000czr3i311rrid/e44123f6-a515-46c6-95fa-78c665e33007-main-token-metadata-cmb2xvddo0000czr3i311rrid.json	\N	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	PENDING
cmb02r4rb0001cz1n2j6onvpx	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"CUSTOM DESCRIPTION","notes":"","evmOwnerAddress":null}	BLEHH	0.0001	ETH	2025-05-23 00:40:40.92	2025-05-31 20:34:20.755	COMPLETED_COLLECTION	\N	2025-05-23 00:41:01.953	0xda226cd02fac872ef5b8adfea71f1db70278bb39a444265f3af460b864af3879	\N	0x155e70f694E645907d36583Cca893BE52bf3A29f	10	716	\N	/uploads/collections/cmb02r4rb0001cz1n2j6onvpx/984a0cae-68c2-469d-9da9-350a91c66557-main-token-image-cmb02r4rb0001cz1n2j6onvpx.png	\N	\N	81c66056-82cf-4533-b3ba-a16d073fd766-images.jpeg	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://15af-102-91-4-208.ngrok-free.app/api/static/collections/cmb02r4rb0001cz1n2j6onvpx/child-tokens/	https://15af-102-91-4-208.ngrok-free.app/uploads/collections/cmb02r4rb0001cz1n2j6onvpx/1eb4fc7a-f805-4051-a6b7-4301e7101d5c-collection-metadata-cmb02r4rb0001cz1n2j6onvpx.json	BLEHH	https://15af-102-91-4-208.ngrok-free.app/uploads/collections/cmb02r4rb0001cz1n2j6onvpx/1f9de8ef-d827-4b78-8d4d-bdc66395d0c2-main-token-metadata-cmb02r4rb0001cz1n2j6onvpx.json	\N	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	PENDING
cmbcw65oh0000czofedd5gs8s	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"notes":"","evmOwnerAddress":null}	Capital Gardens Estate, Ibeju Lekki	1e-05	ETH	2025-05-31 23:57:24.929	2025-06-02 22:46:53.835	COMPLETED_COLLECTION	\N	2025-05-31 23:57:53.516	0x31f7266afb9ce734e666798f4ef194e0c74904a470a2b04fdc92fea77a100a5a	\N	0x837527fa3206Adcba2a8909CAE39280D606540c4	17	112	\N	/uploads/collections/cmbcw65oh0000czofedd5gs8s/ad68dbf1-072b-4add-8cd4-3ad895b863a1-main-token-image-cmbcw65oh0000czofedd5gs8s.jpeg	Capital Gardens Estate, Ibeju Lekki	Capital Gardens Estate	collections/cmbcw65oh0000czofedd5gs8s/ad68dbf1-072b-4add-8cd4-3ad895b863a1-main-token-image-cmbcw65oh0000czofedd5gs8s.jpeg	10	\N	transaction execution reverted (action="sendTransaction", data=null, reason=null, invocation=null, revert=null, transaction={ "data": "", "from": "0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07", "to": "0xfAE9Ef51fea4D220cD427EC47C8dFDA4a6426De8" }, receipt={ "_type": "TransactionReceipt", "blobGasPrice": null, "blobGasUsed": null, "blockHash": "0x0b17a71aeab6dc59ec9ccfe87e73ddf8bad896dcd72508c88ea5209926cc4312", "blockNumber": 8449770, "contractAddress": null, "cumulativeGasUsed": "12721452", "from": "0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07", "gasPrice": "1000008", "gasUsed": "32684", "hash": "0xb838deeadf458a92c387a151aec06b696148933d7c2915fc4a550d73be82685b", "index": 85, "logs": [  ], "logsBloom": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000", "root": null, "status": 0, "to": "0xfAE9Ef51fea4D220cD427EC47C8dFDA4a6426De8" }, code=CALL_EXCEPTION, version=6.14.1)	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://d47b-102-91-72-108.ngrok-free.app/api/static/collections/cmbcw65oh0000czofedd5gs8s/child-tokens/	https://d47b-102-91-72-108.ngrok-free.app/uploads/collections/cmbcw65oh0000czofedd5gs8s/2f032e6e-5ca1-46ef-bbbd-061b984dfd85-collection-metadata-cmbcw65oh0000czofedd5gs8s.json	Capital Gardens Estate, Ibeju Lekki	https://d47b-102-91-72-108.ngrok-free.app/uploads/collections/cmbcw65oh0000czofedd5gs8s/a9919069-af9c-4771-88de-997eed994f0c-main-token-metadata-cmbcw65oh0000czofedd5gs8s.json	\N	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	PENDING
cmaue9gdx0000cz4e0dpwkvu3	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"sss","notes":"","evmOwnerAddress":null}	test	0.0001	ETH	2025-05-19 01:16:14.517	2025-05-31 20:34:20.755	COMPLETED_COLLECTION	\N	2025-05-19 01:16:28.245	0xc46ebbeea32c69c91ba121ac440cf9f2a858e3d04d1463cd97d03c5c91a6ed1a	\N	0x155e70f694E645907d36583Cca893BE52bf3A29f	8	606	\N	/uploads/collections/cmaue9gdx0000cz4e0dpwkvu3/a2dc5d14-424c-4e3e-9de4-5b4f067b654f-main-token-image-cmaue9gdx0000cz4e0dpwkvu3.jpeg	\N	\N	81c66056-82cf-4533-b3ba-a16d073fd766-images.jpeg	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://8d28-185-107-56-151.ngrok-free.app/api/static/collections/cmaue9gdx0000cz4e0dpwkvu3/child-tokens/	https://8d28-185-107-56-151.ngrok-free.app/uploads/collections/cmaue9gdx0000cz4e0dpwkvu3/5f0369af-5043-418e-8faa-cfb38f04a40d-collection-metadata-cmaue9gdx0000cz4e0dpwkvu3.json	test	https://8d28-185-107-56-151.ngrok-free.app/uploads/collections/cmaue9gdx0000cz4e0dpwkvu3/b6d536fd-7a2e-4f0e-9f68-350bf5792cb1-main-token-metadata-cmaue9gdx0000cz4e0dpwkvu3.json	\N	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	PENDING
cmaueezs00000czlin4ppgmrv	e2525983-7782-4407-acc2-11650349e3e0	\N					\N	\N		\N	\N		\N	\N		\N		\N	\N	\N	\N	{"nftDescription":"sfsf","notes":"","evmOwnerAddress":null}	tets	0.0001	ETH	2025-05-19 01:20:32.928	2025-05-31 20:34:20.755	COMPLETED_COLLECTION	\N	2025-05-19 01:20:50.656	0x1c428272fd463d7c9719dafcbdd38aeaad7d7e4611e0ce584643c9bd491ce562	\N	0x155e70f694E645907d36583Cca893BE52bf3A29f	9	706	\N	/uploads/collections/cmaueezs00000czlin4ppgmrv/33184054-3650-4d5c-803e-91174e990908-main-token-image-cmaueezs00000czlin4ppgmrv.jpeg	\N	\N	81c66056-82cf-4533-b3ba-a16d073fd766-images.jpeg	10	\N	\N	placeholder-image-url	placeholder-metadata-uri	\N	\N	\N	https://8d28-185-107-56-151.ngrok-free.app/api/static/collections/cmaueezs00000czlin4ppgmrv/child-tokens/	https://8d28-185-107-56-151.ngrok-free.app/uploads/collections/cmaueezs00000czlin4ppgmrv/4e8b2263-b353-4407-9af5-74e484e3978e-collection-metadata-cmaueezs00000czlin4ppgmrv.json	tets	https://8d28-185-107-56-151.ngrok-free.app/uploads/collections/cmaueezs00000czlin4ppgmrv/658bc0c1-dca9-4725-bf48-a34de3e0a13b-main-token-metadata-cmaueezs00000czlin4ppgmrv.json	\N	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	PENDING
\.


--
-- Data for Name: nft_bids; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nft_bids (id, land_listing_id, bidder_user_id, bid_amount, bid_status, transaction_hash, created_at, updated_at, token_id) FROM stdin;
cmb6ijmr300d1czd47rmr2mme	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.002	OUTBID	test-hash-debug	2025-05-27 12:49:21.903	2025-05-27 12:56:45.761	104
cmb6it58s00flczd45k58mra2	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	OUTBID	test-low-bid	2025-05-27 12:56:45.773	2025-05-27 13:11:10.919	104
cmb6jbosz00khczd4m91j365d	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.002	OUTBID	test-valid-bid	2025-05-27 13:11:10.932	2025-05-27 13:12:07.618	104
cmb4rctot0001czf3pwrhktls	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	OUTBID	0x123test	2025-05-26 07:20:28.493	2025-05-26 12:58:30.243	0
cmb53fj6s0003czf3nwik0vk3	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.002	WITHDRAWN	0x456test	2025-05-26 12:58:30.244	2025-05-26 14:12:08.791	0
cmb53nlp10001czkncm3sjsey	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	OUTBID	0x0e7d781decb6c6d91fbe195ca2375a0913f260bfa3b7da482ed1c0c3d6b0d37b	2025-05-26 05:17:00	2025-05-26 14:24:33.779	0
cmb6jcwke00kxczd4jr036sp5	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.0025	OUTBID	test-low-bid-2	2025-05-27 13:12:07.646	2025-05-27 13:16:16.662	104
cmb5n4vmi0003czxoy7k8farh	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	ACCEPTED	0x62bda7d38043f78b95ca970ea81845a617d501c7f95065b62071c3865a615b8c	2025-05-26 22:10:05.466	2025-05-27 00:14:09.971	0
cmb5wb90r0001czyvgbxlau77	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.05	CANCELLED	0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef1	2025-05-27 02:26:59.308	2025-05-27 03:18:13.6	1
cmb53nlpg0003czknh2mdylaw	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	OUTBID	0x08539f0b4afe0630fe645c4b4df65819cbedfa8f876045571a90fc7854259d23	2025-05-26 07:09:24	2025-05-27 03:18:13.626	0
cmb5dk6c10001czz2le4lqy2b	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	OUTBID	0x21b2369e91ba41e13ea3e883f8b257051fcd8a326ea8bf735251656da4bda0af	2025-05-26 17:42:03.025	2025-05-27 03:18:13.626	0
cmb5yipx0001hcz51zge82wyz	cmb2wcefj0000czlrzwoxaitp	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	ACCEPTED	0x9ccdb99b317b280b8892c8f65c52ac18344884416e6ec155441a2ef07868b901	2025-05-27 03:28:47.028	2025-05-27 03:47:05.48	96
cmb5zknjx0001cz0iomzhlgfi	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	OUTBID	SYNCED_FROM_BLOCKCHAIN	2025-05-27 01:58:48	2025-05-27 12:49:21.888	102
cmb6hvwto0001czxp5qin3rrx	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	OUTBID	SYNCED_FROM_BLOCKCHAIN	2025-05-26 17:42:00	2025-05-27 12:49:21.888	106
cmb6i3ck70001czuirheqejc8	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	OUTBID	SYNCED_FROM_BLOCKCHAIN	2025-05-26 05:17:00	2025-05-27 12:49:21.888	104
cmb6i3ctp0003czuiupv5z54a	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	OUTBID	SYNCED_FROM_BLOCKCHAIN	2025-05-26 07:09:24	2025-05-27 12:49:21.888	105
cmb6i3d2z0005czui296lgq46	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	OUTBID	SYNCED_FROM_BLOCKCHAIN	2025-05-26 22:10:00	2025-05-27 12:49:21.888	107
cmb6ji8q100mdczd4qyjtwk50	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.004	OUTBID	test-valid-final	2025-05-27 13:16:16.681	2025-05-27 14:11:53.934	104
cmb6lbw7m0051cz3e47xa80l7	cmb2xvddo0000czr3i311rrid	e2525983-7782-4407-acc2-11650349e3e0	0.002	OUTBID	test-your-bid-sync	2025-05-27 14:07:19.762	2025-05-27 14:12:17.702	106
cmb6lhrrv006pcz3e0bwnkgbj	cmb2xvddo0000czr3i311rrid	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	OUTBID	0x5aec84abcee319689b4bb3b602e93784618a1b13121789c1bffc51b914963283	2025-05-27 14:11:53.947	2025-05-27 14:12:17.714	108
cmbin7y0e0001czfoaq160ksg	cmbilzsjl0000czzpnmbke17t	2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	0.001	ACCEPTED	0xd069c7dbb15f4b40c249cdaa5d1e78292fb98dea7ce7855b148f8a62c472dd0a	2025-06-05 00:33:28.814	2025-06-05 00:34:50.636	10
cmb6mc2y900evcz3e16z5lob5	cmb2xvddo0000czr3i311rrid	eb2b3d87-ef59-4899-aef3-d525aed2cf86	0.003	OUTBID	0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef	2025-05-27 14:35:28.113	2025-05-27 14:38:03.618	109
cmb6lia440073cz3ejpckhcjd	cmb2xvddo0000czr3i311rrid	e2525983-7782-4407-acc2-11650349e3e0	0.002	ACCEPTED	user-bid-104-final	2025-05-27 14:12:17.717	2025-05-27 15:55:17.611	104
\.


--
-- Data for Name: nft_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nft_transactions (id, land_listing_id, token_id, from_address, to_address, price, transaction_hash, transaction_type, created_at) FROM stdin;
cmb4my5qg0001cz5qy2k7yoae	cmb2xvddo0000czr3i311rrid	104	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0x0e7d781decb6c6d91fbe195ca2375a0913f260bfa3b7da482ed1c0c3d6b0d37b	BID_PLACED	2025-05-26 05:17:05.8
cmb4qyo6l0001czd1dh4tqaaq	cmb2xvddo0000czr3i311rrid	105	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0x08539f0b4afe0630fe645c4b4df65819cbedfa8f876045571a90fc7854259d23	BID_PLACED	2025-05-26 07:09:28.173
cmb5dk79t0003czz2x9e57v89	cmb2xvddo0000czr3i311rrid	106	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0x21b2369e91ba41e13ea3e883f8b257051fcd8a326ea8bf735251656da4bda0af	BID_PLACED	2025-05-26 17:42:04.241
cmb5gew8g0001czdb9qxr8fnt	cmb2xvddo0000czr3i311rrid	0	0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0x08539f0b4afe0630fe645c4b4df65819cbedfa8f876045571a90fc7854259d23	BID_ACCEPTED	2025-05-26 19:01:55.504
cmb5mu8pz0001czxo7nlic321	cmb2xvddo0000czr3i311rrid	0	0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0x21b2369e91ba41e13ea3e883f8b257051fcd8a326ea8bf735251656da4bda0af	BID_ACCEPTED	2025-05-26 22:01:49.223
cmb5n4wj10005czxo4yl865uk	cmb2xvddo0000czr3i311rrid	107	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0x62bda7d38043f78b95ca970ea81845a617d501c7f95065b62071c3865a615b8c	BID_PLACED	2025-05-26 22:10:06.638
cmb5rkfuy0001cz9y5ypwl01b	cmb2xvddo0000czr3i311rrid	0	0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0x62bda7d38043f78b95ca970ea81845a617d501c7f95065b62071c3865a615b8c	BID_ACCEPTED	2025-05-27 00:14:09.994
cmb5vb4xx004nczzaf24vry9p	cmb2xvddo0000czr3i311rrid	102	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0x99409b25479cd6997ae1da2e94df636800aa77f7651b0551dca65478494c75a1	BID_PLACED	2025-05-27 01:58:54.406
cmb5yjkab001lcz511gzyrhsu	cmb2wcefj0000czlrzwoxaitp	96	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0x9ccdb99b317b280b8892c8f65c52ac18344884416e6ec155441a2ef07868b901	BID_PLACED	2025-05-27 03:29:26.387
cmb5z69hz0051cz51f1qg9qm9	cmb2wcefj0000czlrzwoxaitp	96	0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0x9858aa0b04d7a32411f1f19d1dec0b81f738011c2dd4a1f8009a457e8d97e936	BID_ACCEPTED	2025-05-27 03:47:05.495
cmb6jyqbf00qpczd42lpi92w0	cmb2xvddo0000czr3i311rrid	104	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.002	0xda4b3fd4c6511abc5311757dcceb4266632e50b1372d6345c95c075b91fa31fa	BID_PLACED	2025-05-27 13:29:05.979
cmb6lhs9z006tcz3et02l8qkf	cmb2xvddo0000czr3i311rrid	108	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0x5aec84abcee319689b4bb3b602e93784618a1b13121789c1bffc51b914963283	BID_PLACED	2025-05-27 14:11:54.6
cmb6p6qmt000nczf7pwekf9o9	cmb2xvddo0000czr3i311rrid	104	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07	0.002	0x52f3dbfc771dfce0cb451ecb125c54297357ea3b744ba18fbad969fa318048f0	BID_ACCEPTED	2025-05-27 15:55:17.717
cmbin80df0005czfooljw8s0s	cmbilzsjl0000czzpnmbke17t	10	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0xd069c7dbb15f4b40c249cdaa5d1e78292fb98dea7ce7855b148f8a62c472dd0a	BID_PLACED	2025-06-05 00:33:31.875
cmbin9pbj000dczfojqkh246p	cmbilzsjl0000czzpnmbke17t	10	0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	0.001	0xd6c5857d04d07030041de8e721a20e750b28b4594c3cb5baad1341785289ff53	BID_ACCEPTED	2025-06-05 00:34:50.863
\.


--
-- Data for Name: nfts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nfts (id, name, "itemNumber", image, price, "createdAt", "updatedAt", "propertyId", "ownerId", "isListed", land_listing_id) FROM stdin;
\.


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.offers (id, "nftId", "offererId", price, status, "expiresAt", "createdAt", "updatedAt", "userId") FROM stdin;
\.


--
-- Data for Name: properties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.properties (id, name, items, volume, "floorPrice", image, category, verified, "createdAt", "updatedAt", "userId", description) FROM stdin;
\.


--
-- Data for Name: trades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trades (id, "nftId", "buyerId", "sellerId", price, "timestamp", "creatorId") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, full_name, address_line1, address_line2, city, state_province, postal_code, country, created_at, updated_at, sign_in_nonce, evm_address, date_of_birth, gov_id_ref, gov_id_type, kyc_verified, phone, auth_type, is_admin, wallet_address) FROM stdin;
cc10358c-a610-4b57-9b89-5846b7aa2f1b	test2	\N	$2a$10$aKXa1S9QAOgkayZDRvLZ0.D8XpT8Aaruw4HK52wVF5xaDlknkvVxy	\N	\N	\N	\N	\N	\N	\N	2025-05-26 03:53:30.748	2025-05-26 03:53:30.748	\N	\N	\N	\N	\N	f	\N	email	f	\N
7e167862-4121-4e5c-8475-61a89195a6e7	user_1747084573696	user_1747084573696@example.com	placeholder	\N	\N	\N	\N	\N	\N	\N	2025-05-12 21:16:13.697	2025-05-12 21:16:13.697	\N	\N	\N	\N	\N	f	\N	email	f	\N
2e0ab3b0-10c5-4dba-8858-ffe4c0e15d4e	bidder_user	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-26 07:20:08.001	2025-05-26 07:20:08.001	\N	0x6BE90E278ff81b25e2E48351c346886F8F50e99e	\N	\N	\N	f	\N	wallet	f	\N
5469d399-951e-4d76-ab6f-3e98a809726b	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-31 13:39:55.125	2025-05-31 13:40:49.364	a6cec55dab9ea25964aeb9ff01280f24	0x1234567890123456789012345678901234567890	\N	\N	\N	f	\N	email	f	\N
e2525983-7782-4407-acc2-11650349e3e0	admin	admin@example.com	$2a$10$nFqohODnWgOIfcvzK3fQZexIfU8qNQsp3uFKW1GQG74ktoscCGrMq	xt GLITCH	\N	\N	\N	\N	\N	\N	2025-05-12 16:44:38.251	2025-06-24 14:33:28.067	\N	\N	\N	\N	\N	f	\N	email	t	\N
eb2b3d87-ef59-4899-aef3-d525aed2cf86	test	flame.breathe.co@gmail.com	$2a$10$ugXSwggCL.a0EwPW9knM9OAJlct33i6/WoDOA/AxppIHGWT26slGu	xt GLITCH	22s	gffdgdf	Lagos	Lagos	102103	Nigeria	2025-05-27 01:12:51.44	2025-06-25 14:20:28.307	\N	0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07	\N	\N	\N	t	\N	email	f	\N
4d65f559-1b7e-4a91-8139-3140cc3e8445	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-05-31 13:46:41.097	2025-05-31 13:54:55.833	9fdf802bba31a380a25047992bfec80c	0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6	\N	\N	\N	f	\N	email	f	\N
\.


--
-- Data for Name: watchlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.watchlist (id, "userId", "collectionId", "createdAt") FROM stdin;
\.


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: collection_price_history collection_price_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection_price_history
    ADD CONSTRAINT collection_price_history_pkey PRIMARY KEY (id);


--
-- Name: evm_collection_tokens evm_collection_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evm_collection_tokens
    ADD CONSTRAINT evm_collection_tokens_pkey PRIMARY KEY (id);


--
-- Name: kyc_update_requests kyc_update_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc_update_requests
    ADD CONSTRAINT kyc_update_requests_pkey PRIMARY KEY (id);


--
-- Name: land_listings land_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_listings
    ADD CONSTRAINT land_listings_pkey PRIMARY KEY (id);


--
-- Name: nft_bids nft_bids_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nft_bids
    ADD CONSTRAINT nft_bids_pkey PRIMARY KEY (id);


--
-- Name: nft_transactions nft_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nft_transactions
    ADD CONSTRAINT nft_transactions_pkey PRIMARY KEY (id);


--
-- Name: nfts nfts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nfts
    ADD CONSTRAINT nfts_pkey PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: trades trades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT trades_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: watchlist watchlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT watchlist_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Account_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Account_userId_idx" ON public."Account" USING btree ("userId");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: Session_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Session_userId_idx" ON public."Session" USING btree ("userId");


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: collection_price_history_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX collection_price_history_created_at_idx ON public.collection_price_history USING btree (created_at);


--
-- Name: collection_price_history_land_listing_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX collection_price_history_land_listing_id_idx ON public.collection_price_history USING btree (land_listing_id);


--
-- Name: collection_price_history_price_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX collection_price_history_price_type_idx ON public.collection_price_history USING btree (price_type);


--
-- Name: evm_collection_tokens_is_listed_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evm_collection_tokens_is_listed_idx ON public.evm_collection_tokens USING btree (is_listed);


--
-- Name: evm_collection_tokens_is_main_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evm_collection_tokens_is_main_token_idx ON public.evm_collection_tokens USING btree (is_main_token);


--
-- Name: evm_collection_tokens_land_listing_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evm_collection_tokens_land_listing_id_idx ON public.evm_collection_tokens USING btree (land_listing_id);


--
-- Name: evm_collection_tokens_mint_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evm_collection_tokens_mint_status_idx ON public.evm_collection_tokens USING btree (mint_status);


--
-- Name: evm_collection_tokens_nft_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evm_collection_tokens_nft_id_idx ON public.evm_collection_tokens USING btree (nft_id);


--
-- Name: evm_collection_tokens_owner_address_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evm_collection_tokens_owner_address_idx ON public.evm_collection_tokens USING btree (owner_address);


--
-- Name: evm_collection_tokens_token_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX evm_collection_tokens_token_id_idx ON public.evm_collection_tokens USING btree (token_id);


--
-- Name: idx_users_evm_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_evm_address ON public.users USING btree (evm_address);


--
-- Name: kyc_update_requests_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kyc_update_requests_status_idx ON public.kyc_update_requests USING btree (status);


--
-- Name: kyc_update_requests_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "kyc_update_requests_userId_idx" ON public.kyc_update_requests USING btree ("userId");


--
-- Name: land_listings_collection_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX land_listings_collection_id_key ON public.land_listings USING btree (collection_id);


--
-- Name: land_listings_mint_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX land_listings_mint_status_idx ON public.land_listings USING btree (mint_status);


--
-- Name: land_listings_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX land_listings_slug_key ON public.land_listings USING btree (slug);


--
-- Name: land_listings_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX land_listings_status_idx ON public.land_listings USING btree (status);


--
-- Name: land_listings_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "land_listings_userId_idx" ON public.land_listings USING btree ("userId");


--
-- Name: nft_bids_bid_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX nft_bids_bid_status_idx ON public.nft_bids USING btree (bid_status);


--
-- Name: nft_bids_bidder_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX nft_bids_bidder_user_id_idx ON public.nft_bids USING btree (bidder_user_id);


--
-- Name: nft_bids_land_listing_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX nft_bids_land_listing_id_idx ON public.nft_bids USING btree (land_listing_id);


--
-- Name: nft_bids_token_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX nft_bids_token_id_idx ON public.nft_bids USING btree (token_id);


--
-- Name: nfts_isListed_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "nfts_isListed_idx" ON public.nfts USING btree ("isListed");


--
-- Name: nfts_ownerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "nfts_ownerId_idx" ON public.nfts USING btree ("ownerId");


--
-- Name: nfts_propertyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "nfts_propertyId_idx" ON public.nfts USING btree ("propertyId");


--
-- Name: nfts_propertyId_itemNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "nfts_propertyId_itemNumber_key" ON public.nfts USING btree ("propertyId", "itemNumber");


--
-- Name: offers_nftId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "offers_nftId_idx" ON public.offers USING btree ("nftId");


--
-- Name: offers_offererId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "offers_offererId_idx" ON public.offers USING btree ("offererId");


--
-- Name: offers_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX offers_status_idx ON public.offers USING btree (status);


--
-- Name: properties_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "properties_userId_idx" ON public.properties USING btree ("userId");


--
-- Name: trades_buyerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "trades_buyerId_idx" ON public.trades USING btree ("buyerId");


--
-- Name: trades_creatorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "trades_creatorId_idx" ON public.trades USING btree ("creatorId");


--
-- Name: trades_nftId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "trades_nftId_idx" ON public.trades USING btree ("nftId");


--
-- Name: trades_sellerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "trades_sellerId_idx" ON public.trades USING btree ("sellerId");


--
-- Name: trades_timestamp_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX trades_timestamp_idx ON public.trades USING btree ("timestamp");


--
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_evm_address_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_evm_address_key ON public.users USING btree (evm_address);


--
-- Name: users_username_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_username_idx ON public.users USING btree (username);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: users_wallet_address_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_wallet_address_key ON public.users USING btree (wallet_address);


--
-- Name: watchlist_collectionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "watchlist_collectionId_idx" ON public.watchlist USING btree ("collectionId");


--
-- Name: watchlist_userId_collectionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "watchlist_userId_collectionId_key" ON public.watchlist USING btree ("userId", "collectionId");


--
-- Name: watchlist_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "watchlist_userId_idx" ON public.watchlist USING btree ("userId");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: collection_price_history collection_price_history_land_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection_price_history
    ADD CONSTRAINT collection_price_history_land_listing_id_fkey FOREIGN KEY (land_listing_id) REFERENCES public.land_listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evm_collection_tokens evm_collection_tokens_land_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evm_collection_tokens
    ADD CONSTRAINT evm_collection_tokens_land_listing_id_fkey FOREIGN KEY (land_listing_id) REFERENCES public.land_listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: evm_collection_tokens evm_collection_tokens_nft_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evm_collection_tokens
    ADD CONSTRAINT evm_collection_tokens_nft_id_fkey FOREIGN KEY (nft_id) REFERENCES public.nfts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: kyc_update_requests kyc_update_requests_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc_update_requests
    ADD CONSTRAINT "kyc_update_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: land_listings land_listings_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.land_listings
    ADD CONSTRAINT "land_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nft_bids nft_bids_bidder_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nft_bids
    ADD CONSTRAINT nft_bids_bidder_user_id_fkey FOREIGN KEY (bidder_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: nft_bids nft_bids_land_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nft_bids
    ADD CONSTRAINT nft_bids_land_listing_id_fkey FOREIGN KEY (land_listing_id) REFERENCES public.land_listings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: nft_transactions nft_transactions_land_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nft_transactions
    ADD CONSTRAINT nft_transactions_land_listing_id_fkey FOREIGN KEY (land_listing_id) REFERENCES public.land_listings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: nfts nfts_land_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nfts
    ADD CONSTRAINT nfts_land_listing_id_fkey FOREIGN KEY (land_listing_id) REFERENCES public.land_listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nfts nfts_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nfts
    ADD CONSTRAINT "nfts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: nfts nfts_propertyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nfts
    ADD CONSTRAINT "nfts_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: offers offers_nftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT "offers_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES public.nfts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: offers offers_offererId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT "offers_offererId_fkey" FOREIGN KEY ("offererId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: offers offers_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT "offers_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: properties properties_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT "properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trades trades_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT "trades_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trades trades_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT "trades_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: trades trades_nftId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT "trades_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES public.nfts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: trades trades_sellerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trades
    ADD CONSTRAINT "trades_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: watchlist watchlist_collectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT "watchlist_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES public.land_listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: watchlist watchlist_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watchlist
    ADD CONSTRAINT "watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

