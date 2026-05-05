package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type category struct {
	Name        string
	Description string
}

type product struct {
	Name              string
	Description       string
	Price             float64
	Stock             int
	Unit              string
	Category          string
	LowStockThreshold int
	ImageURL          string
}

type setting struct {
	Key   string
	Value string
}

func main() {
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	db, err := sqlx.Open("pgx", dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("Starting seed...")

	// ==================== ADMIN ====================
	adminPassword := os.Getenv("SEED_ADMIN_PASSWORD")
	if adminPassword == "" {
		adminPassword = "replace-with-local-admin-password"
	}

	adminHash, err := bcrypt.GenerateFromPassword([]byte(adminPassword), 12)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	_, err = db.ExecContext(ctx, `
		INSERT INTO admins (email, password_hash, name)
		VALUES ($1, $2, $3)
		ON CONFLICT (email) DO NOTHING
	`, "admin@planetmotorbmw.com", string(adminHash), "Admin Planet Motor BMW")
	if err != nil {
		log.Fatalf("Failed to seed admin: %v", err)
	}
	fmt.Println("Admin created: admin@planetmotorbmw.com")

	// ==================== CATEGORIES ====================
	categories := []category{
		{Name: "Rak Lampu", Description: "Lampu, stoplamp, foglamp, dan modul pencahayaan BMW"},
		{Name: "Rak Spare Part", Description: "Spare part mesin, kelistrikan, kaki-kaki, dan interior BMW"},
		{Name: "Rak Kaca", Description: "Kaca spion, kaca pintu, dan komponen kaca BMW"},
		{Name: "Variasi", Description: "Aksesori, body kit, dan part variasi BMW"},
		{Name: "Bumper & Cover", Description: "Bumper, cover, trim body, dan pelipit BMW"},
		{Name: "Ban Velg", Description: "Velg dan komponen roda BMW"},
	}

	categoryIDs := make(map[string]string)
	for _, cat := range categories {
		slug := slugify(cat.Name)
		var id string
		err := db.QueryRowContext(ctx, `
			INSERT INTO categories (name, slug, description, image_url)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (slug) DO UPDATE
			SET name = EXCLUDED.name,
			    description = EXCLUDED.description,
			    image_url = EXCLUDED.image_url
			RETURNING id
		`, cat.Name, slug, cat.Description, "").Scan(&id)
		if err != nil {
			log.Fatalf("Failed to seed category %s: %v", cat.Name, err)
		}
		categoryIDs[cat.Name] = id
	}
	fmt.Printf("Categories upserted: %d\n", len(categories))

	// ==================== PRODUCTS ====================
	products := []product{
		{Name: "Velg R18 BMW F45", Description: "Velg R18 BMW F45. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 4500000, Stock: 2, Unit: "pcs", Category: "Ban Velg", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/12/10/8496c6d9-8d05-480e-a5df-93d69119f91b.jpg"},
		{Name: "Velg R18 BMW X1-E84", Description: "Velg R18 BMW X1-E84. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 4200000, Stock: 2, Unit: "pcs", Category: "Ban Velg", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/6/19/1b174dc6-0f42-4165-8b9d-038ed6117638.jpg"},
		{Name: "Velg R18.Bmw F30", Description: "Velg R18.Bmw F30. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 4500000, Stock: 2, Unit: "pcs", Category: "Ban Velg", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/12/10/8c4ab803-4d12-4182-a3a9-39cf478b45f9.jpg"},
		{Name: "bumper belakang (RR) BMW F10 LCI", Description: "bumper belakang (RR) BMW F10 LCI. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 5000000, Stock: 2, Unit: "pcs", Category: "Bumper & Cover", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/7/31/334e6b42-d2ec-4a9e-83b1-c992046284c5.jpg"},
		{Name: "Bumper belakang Bmw E90 new ori", Description: "Bumper belakang Bmw E90 new ori. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 7000000, Stock: 2, Unit: "pcs", Category: "Bumper & Cover", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2019/8/30/546388481/546388481_c16c6a31-0051-4cd3-89a3-c601723ce2db_1024_1024.jpg"},
		{Name: "bumper belakang BMW F25 / X3", Description: "bumper belakang BMW F25 / X3. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 5000000, Stock: 2, Unit: "pcs", Category: "Bumper & Cover", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/7/31/12f7d66b-311d-47ef-adb7-c1c274171596.jpg"},
		{Name: "Bumper BMW G30 depan belakang komplit New Ori", Description: "Bumper BMW G30 depan belakang komplit New Ori. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 20000000, Stock: 2, Unit: "pcs", Category: "Bumper & Cover", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/8/2/510192ac-6fe7-45e4-a531-fef03928bc7c.jpg"},
		{Name: "Bumper Depan Assy Bmw F12", Description: "Bumper Depan Assy Bmw F12. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 6500000, Stock: 2, Unit: "pcs", Category: "Bumper & Cover", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2019/7/14/3226595/3226595_a52d7389-cd0a-4fc7-b57d-cbd26403079c_1024_1024.jpg"},
		{Name: "Cover bawah Gearbox BMW X3 F25", Description: "Cover bawah Gearbox BMW X3 F25. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1300000, Stock: 2, Unit: "pcs", Category: "Bumper & Cover", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2018/12/11/3226595/3226595_e9269435-1dea-4602-b62b-8a146fe5de2b_585_585.jpg"},
		{Name: "Cover Bumper Depan BMW X5-E70", Description: "Cover Bumper Depan BMW X5-E70. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1350000, Stock: 2, Unit: "pcs", Category: "Bumper & Cover", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2018/11/8/3226595/3226595_1ddc56f2-5910-40f5-827e-cc8bb88035b4_768_768.jpg"},
		{Name: "Cover dek bawah Mesin Depan kanan BMW. X3-F25", Description: "Cover dek bawah Mesin Depan kanan BMW. X3-F25. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1150000, Stock: 2, Unit: "pcs", Category: "Bumper & Cover", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/10/19/78c6482f-8824-4edd-b1c6-ac2b8a0a232e.jpg"},
		{Name: "Cover exhaust ACS BMW E46-325i", Description: "Cover exhaust ACS BMW E46-325i. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1150000, Stock: 2, Unit: "pcs", Category: "Bumper & Cover", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2018/4/4/0/0_62776b9d-4a45-472a-bfde-46ebbdfdbe85_540_434.jpg"},
		{Name: "Cover exhaust/knalpot croom Bmw F10 & F10 Lci", Description: "Cover exhaust/knalpot croom Bmw F10 & F10 Lci. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1100000, Stock: 2, Unit: "pcs", Category: "Bumper & Cover", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2019/4/11/3226595/3226595_8f4d5a32-7919-4cf0-965b-ae892c6b0d60_1728_1728.jpg"},
		{Name: "Cover Spion BMW F30 LH copotan", Description: "Cover Spion BMW F30 LH copotan. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1000000, Stock: 2, Unit: "pcs", Category: "Rak Kaca", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2023/12/4/f707926b-f93f-43eb-822f-7b4c7f8527da.jpg"},
		{Name: "COVER SPION BMW F30 SEBELAH KANAN", Description: "COVER SPION BMW F30 SEBELAH KANAN. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1000000, Stock: 2, Unit: "pcs", Category: "Rak Kaca", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2024/1/11/b7c81c9b-b828-4143-b072-365299ccfe38.jpg"},
		{Name: "COVER SPION BMW G20 /G21 SEBELAH KIRI THN 2021", Description: "COVER SPION BMW G20 /G21 SEBELAH KIRI THN 2021. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1300000, Stock: 2, Unit: "pcs", Category: "Rak Kaca", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2024/1/9/7e1298f9-8a54-46e2-aaa6-99c7ba69dfd0.jpg"},
		{Name: "pelipit Kaca luar pintu Depan Kiri BMW X3-G01", Description: "pelipit Kaca luar pintu Depan Kiri BMW X3-G01. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1150000, Stock: 2, Unit: "pcs", Category: "Rak Kaca", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/11/23/fdb09913-d5bd-4929-86bd-d019ea636356.jpg"},
		{Name: "Pelipit Kaca pintu Depan Kiri bagian luar. MINI COOPER F60", Description: "Pelipit Kaca pintu Depan Kiri bagian luar. MINI COOPER F60. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 525000, Stock: 2, Unit: "pcs", Category: "Rak Kaca", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/11/23/ac7d462f-f41c-4fb9-b7a3-d110e4728abb.jpg"},
		{Name: "Planet Motor BMW Spion Mobil BMW G20 Original Retract Fungsi Hidup Part Number 51 16 9 854 787 & 51 16 9 854 788 Al 13 Q3", Description: "Planet Motor BMW Spion Mobil BMW G20 Original Retract Fungsi Hidup Part Number 51 16 9 854 787 & 51 16 9 854 788 Al 13 Q3. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 14000000, Stock: 2, Unit: "pcs", Category: "Rak Kaca", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2022/3/9/91d55fce-5dbe-4cb4-944b-378eb0a31000.jpg"},
		{Name: "spion BMW X3 G01", Description: "spion BMW X3 G01. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 7000000, Stock: 2, Unit: "pcs", Category: "Rak Kaca", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/11/6/5c7b781d-9f27-4c35-be1d-06037c04f4c9.jpg"},
		{Name: "Spion kanan Kiri BMW F30 & F30 Lci + cover + kaca spion", Description: "Spion kanan Kiri BMW F30 & F30 Lci + cover + kaca spion. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 8000000, Stock: 2, Unit: "pcs", Category: "Rak Kaca", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2019/9/10/433691987/433691987_1b6365a4-1d9c-44e4-bdeb-35268408b799_2048_2048.jpg"},
		{Name: "Spion kanan Kiri Bmw X5-F15", Description: "Spion kanan Kiri Bmw X5-F15. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 7000000, Stock: 2, Unit: "pcs", Category: "Rak Kaca", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2019/3/16/427570059/427570059_bcbdebce-71d6-41b4-8d1a-dcaa3719116e_1152_1152.jpg"},
		{Name: "Spion Retract set BMW F10 lci", Description: "Spion Retract set BMW F10 lci. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 8000000, Stock: 2, Unit: "pcs", Category: "Rak Kaca", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/4/30/b237f376-a93c-4f12-a232-236778b8f654.jpg"},
		{Name: "Foglamp BMW F10 LCI Lh", Description: "Foglamp BMW F10 LCI Lh. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1500000, Stock: 2, Unit: "pcs", Category: "Rak Lampu", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/12/14/999060d6-1147-4d4a-b098-1ddf32883e86.jpg"},
		{Name: "Foglamp set Bmw E65/E66 - Biru", Description: "Foglamp set Bmw E65/E66 - Biru. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1400000, Stock: 2, Unit: "pcs", Category: "Rak Lampu", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2019/3/2/3226595/3226595_145862f2-91e9-4a47-9214-9f0ab20b3647_452_452.jpg"},
		{Name: "Foglamp set BMW E90", Description: "Foglamp set BMW E90. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1400000, Stock: 2, Unit: "pcs", Category: "Rak Lampu", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/3/6/36e7f14d-6694-444a-ae93-774cc1156ee9.jpg"},
		{Name: "Headlamp Adaptive LED BMW X5-F15 & X6-F16", Description: "Headlamp Adaptive LED BMW X5-F15 & X6-F16. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 16000000, Stock: 2, Unit: "pcs", Category: "Rak Lampu", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/2/28/d0ccf40e-22c1-4d90-a312-5ce02a990cad.jpg"},
		{Name: "Headlamp Adaptive LED kiri BMW X3-G01", Description: "Headlamp Adaptive LED kiri BMW X3-G01. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 20000000, Stock: 2, Unit: "pcs", Category: "Rak Lampu", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/12/8/c794e1b4-38fb-4ebc-ac68-b76b4d29875f.jpg"},
		{Name: "HeadLamp BMW G20 LH", Description: "HeadLamp BMW G20 LH. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 30000000, Stock: 2, Unit: "pcs", Category: "Rak Lampu", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/8/21/732fbc13-ff2d-43a4-8d6b-7e73644540a8.jpg"},
		{Name: "Headlamp led Assy BMW X1-e84 Lci", Description: "Headlamp led Assy BMW X1-e84 Lci. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 18000000, Stock: 2, Unit: "pcs", Category: "Rak Lampu", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/12/10/58ebd13d-bc20-47ec-a344-3804f73116b5.jpg"},
		{Name: "lampu baca plafon Depan BMW E39", Description: "lampu baca plafon Depan BMW E39. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 400000, Stock: 2, Unit: "pcs", Category: "Rak Lampu", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/2/26/957234e5-abb9-4c9b-b981-d8e3cd94deca.jpg"},
		{Name: "Stoplamp LED & bagasi set kanan kiri BMW G30 lci", Description: "Stoplamp LED & bagasi set kanan kiri BMW G30 lci. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 20500000, Stock: 2, Unit: "pcs", Category: "Rak Lampu", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/3/11/6b76d827-3a6a-49b6-8b1e-c5b21c5f83a8.jpg"},
		{Name: "switch lampu X1 f48", Description: "switch lampu X1 f48. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 1400000, Stock: 2, Unit: "pcs", Category: "Rak Lampu", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/8/23/ae57d512-53b4-4a4b-8e81-04c7f6ab7d56.jpg"},
		{Name: "As roda belakang kanan BMW X1-E84", Description: "As roda belakang kanan BMW X1-E84. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 7000000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2018/8/18/3226595/3226595_12467609-529b-4c28-94cf-42d999b9a9c7_540_318.jpg"},
		{Name: "Bagasi BMW RR X1-F48", Description: "Bagasi BMW RR X1-F48. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 9000000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/7/10/040c120b-c1cb-44b9-8eca-fbf289d886ca.jpg"},
		{Name: "Clip body bmw G30 kondisi baru", Description: "Clip body bmw G30 kondisi baru. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 16000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/7/13/2ae06385-b388-431e-bd3e-461bc46abd30.jpg"},
		{Name: "disc brake bmw f10 lci & non, f01, f02, f07 GT, f12", Description: "disc brake bmw f10 lci & non, f01, f02, f07 GT, f12. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 10000000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/7/26/3d5b4eb2-ca09-4a60-8b43-0f8929ca8c7f.jpg"},
		{Name: "Fender Depan set Bmw E90 & E90 LCI", Description: "Fender Depan set Bmw E90 & E90 LCI. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 7500000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2018/8/17/3226595/3226595_df76ace5-d590-4153-835e-56cbbdd36044_563_540.jpg"},
		{Name: "Front Windshield Wiper Motor BMW X5 G05", Description: "Front Windshield Wiper Motor BMW X5 G05. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 6800000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/11/12/818474e3-e0ff-4707-b303-bbb2590bb081.jpg"},
		{Name: "GPS tv screen monitor BMW E90 E90 lci E60 E60 lci", Description: "GPS tv screen monitor BMW E90 E90 lci E60 E60 lci. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 8000000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/12/21/f0eb9070-2ca8-47f5-a275-ad5a4c3711d9.jpg"},
		{Name: "Handle Pintu dalam depan Kiri BMW E87", Description: "Handle Pintu dalam depan Kiri BMW E87. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 550000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/2/9/26acef28-3742-4e57-b206-0cb42f2d37a2.jpg"},
		{Name: "Head liner control modul BMW G20 G30 F90 M5 G31 G32 X3 G01 X3 G08 X4", Description: "Head liner control modul BMW G20 G30 F90 M5 G31 G32 X3 G01 X3 G08 X4. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 6000000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/8/25/dce81c19-a6ce-4db4-847e-de88724bac37.jpg"},
		{Name: "instrument spidometer BMW F10 lci F18 lci F11 lci X3 X25", Description: "instrument spidometer BMW F10 lci F18 lci F11 lci X3 X25. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 6500000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/8/25/5bc14b92-682f-4eeb-8f91-fa8d0074aede.jpg"},
		{Name: "Kampas rem belakang BMW E36 & E46", Description: "Kampas rem belakang BMW E36 & E46. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 275000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2020/7/18/3226595/3226595_5bf2bc06-b4a4-46c3-b442-5c1cbfa663d5_871_871.jpg"},
		{Name: "Kampas rem Depan BMW E36 & E46", Description: "Kampas rem Depan BMW E36 & E46. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 375000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2020/7/18/3226595/3226595_92141fb4-78ea-4eab-9421-807f2d902aba_1014_1014.jpg"},
		{Name: "Reluctor engine N55 BMW E90 lci & F30", Description: "Reluctor engine N55 BMW E90 lci & F30. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 425000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2019/7/23/3226595/3226595_a99a1448-00da-421b-a7d0-15a8beb47c3b_1152_1152.jpg"},
		{Name: "Repair kit pressure regulating valve BMW E66 & E70", Description: "Repair kit pressure regulating valve BMW E66 & E70. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 550000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/10/24/3ef68409-b229-4f38-9f69-7f34e5a55f33.jpg"},
		{Name: "Shaft seal engine N52 BMW E90 & E70", Description: "Shaft seal engine N52 BMW E90 & E70. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 400000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2019/7/23/516666065/516666065_3a5c9033-122a-4196-b14b-5355f426de96_769_769.jpg"},
		{Name: "Swith hazard warning/central lckng syst BMW F22 & F30", Description: "Swith hazard warning/central lckng syst BMW F22 & F30. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 550000, Stock: 2, Unit: "pcs", Category: "Rak Spare Part", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/product-1/2020/2/25/712671883/712671883_3c21a99f-020e-4f89-aa8e-bb2597362541_1023_1023.jpg"},
		{Name: "Antenna amplifier Difersity BMW E87 & E81", Description: "Antenna amplifier Difersity BMW E87 & E81. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 850000, Stock: 2, Unit: "pcs", Category: "Variasi", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/2/10/4ace278b-cd43-4ebd-bab7-ffa24271849c.jpg"},
		{Name: "Floor mats bagian depan BMW F30 & F30 LCI", Description: "Floor mats bagian depan BMW F30 & F30 LCI. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 2000000, Stock: 2, Unit: "pcs", Category: "Variasi", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/11/26/d7560811-12cb-46e0-b2af-beaeed138616.jpg"},
		{Name: "knalpot belakang new ori BMW E39", Description: "knalpot belakang new ori BMW E39. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 3500000, Stock: 2, Unit: "pcs", Category: "Variasi", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/10/18/d677893a-bfae-4540-8673-f92a1969b832.jpg"},
		{Name: "Stering wheel with pedal shift assy BMW F30", Description: "Stering wheel with pedal shift assy BMW F30. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 11500000, Stock: 2, Unit: "pcs", Category: "Variasi", LowStockThreshold: 1, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/3/20/34abf095-1e5a-4630-a96d-b5a7c3c0b60e.jpg"},
		{Name: "switch multi fungsi steering BMW E90 E90 lci X1 E84", Description: "switch multi fungsi steering BMW E90 E90 lci X1 E84. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 2000000, Stock: 2, Unit: "pcs", Category: "Variasi", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2021/12/21/bc5c2e22-e1c7-4a25-b108-2ff9c59d9277.jpg"},
		{Name: "Towing hinge new ori BMW F30 & F48", Description: "Towing hinge new ori BMW F30 & F48. Spare part BMW original/copotan berkualitas dari Planet Motor BMW.", Price: 425000, Stock: 2, Unit: "pcs", Category: "Variasi", LowStockThreshold: 2, ImageURL: "https://images.tokopedia.net/img/cache/900/VqbcmM/2020/12/19/de84bbf0-4ef7-4b01-9c92-25ef4d644fbf.jpg"},
	}

	_, err = db.ExecContext(ctx, `
		UPDATE products
		SET deleted_at = NOW(), is_active = false, updated_at = NOW()
		WHERE deleted_at IS NULL
	`)
	if err != nil {
		log.Fatalf("Failed to archive existing products before reseed: %v", err)
	}

	createdCount := 0
	reactivatedCount := 0
	for _, prod := range products {
		slug := slugify(prod.Name)
		catID := categoryIDs[prod.Category]
		status := "AVAILABLE"
		if prod.Stock <= 0 {
			status = "OUT_OF_STOCK"
		}

		var existingID string
		err := db.QueryRowContext(ctx, `
			SELECT id
			FROM products
			WHERE slug = $1
			LIMIT 1
		`, slug).Scan(&existingID)
		if err == nil {
			_, err = db.ExecContext(ctx, `
				UPDATE products
				SET name = $2,
				    description = $3,
				    price = $4,
				    stock = $5,
				    unit = $6,
				    category_id = $7,
				    low_stock_threshold = $8,
				    status = $9::product_status,
				    image_url = $10,
				    is_active = true,
				    deleted_at = NULL,
				    stock_updated_at = NOW(),
				    updated_at = NOW()
				WHERE id = $1
			`, existingID, prod.Name, prod.Description, prod.Price, prod.Stock, prod.Unit, catID, prod.LowStockThreshold, status, prod.ImageURL)
			if err != nil {
				log.Fatalf("Failed to update product %s: %v", prod.Name, err)
			}
			reactivatedCount++
			continue
		}

		_, err = db.ExecContext(ctx, `
			INSERT INTO products (name, slug, description, price, stock, unit, category_id, low_stock_threshold, status, image_url, is_active)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::product_status, $10, true)
		`, prod.Name, slug, prod.Description, prod.Price, prod.Stock, prod.Unit, catID, prod.LowStockThreshold, status, prod.ImageURL)
		if err != nil {
			log.Fatalf("Failed to insert product %s: %v", prod.Name, err)
		}
		createdCount++
	}
	fmt.Printf("Products inserted: %d, reactivated/updated: %d\n", createdCount, reactivatedCount)

	// ==================== STORE SETTINGS ====================
	settings := []setting{
		{Key: "store_name", Value: "Planet Motor BMW"},
		{Key: "store_address", Value: "Kota Administrasi Jakarta Timur"},
		{Key: "store_phone", Value: "08123456789"},
		{Key: "store_email", Value: "admin@planetmotorbmw.com"},
		{Key: "low_stock_threshold_default", Value: "2"},
	}

	for _, s := range settings {
		_, err := db.ExecContext(ctx, `
			INSERT INTO store_settings (key, value)
			VALUES ($1, $2)
			ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
		`, s.Key, s.Value)
		if err != nil {
			log.Fatalf("Failed to seed setting %s: %v", s.Key, err)
		}
	}
	fmt.Printf("Store settings upserted: %d\n", len(settings))

	fmt.Println("Seed completed successfully!")
}

// slugify converts a string to a URL-friendly slug.
func slugify(s string) string {
	s = strings.ToLower(s)
	s = strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			return r
		}
		if r == ' ' || r == '-' || r == '_' {
			return '-'
		}
		return -1
	}, s)
	for strings.Contains(s, "--") {
		s = strings.ReplaceAll(s, "--", "-")
	}
	return strings.Trim(s, "-")
}
