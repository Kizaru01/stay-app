# Temporary design-system photos

Bundled sample photos from Unsplash, downloaded for the development catalogue.
They are illustrative and do not represent StayApp properties, locations or hosts.

- villa.jpg: https://images.unsplash.com/photo-1613977257363-707ba9348227
- cabin.jpg: https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8
- host.jpg: https://images.unsplash.com/photo-1580489944761-15a19d654956

Use real API/Cloudinary image sources when implementing production features.

## Property gallery additions

Downloaded and visually inspected on 2026-11-01. Each linked Pexels photo page
identifies the image as free under the [Pexels license](https://www.pexels.com/license/).
These are illustrative stock photos, grouped by stay concept; they are not a
photographic record of one property or of the Philippine destination named in a
sample listing. Guest counts, descriptions, reviews and prices are also sample data.

| Local file | Photographer | Source |
| --- | --- | --- |
| pool-terrace.jpg | Vincent Rivaud | https://www.pexels.com/photo/private-swimming-pool-in-villa-4146874/ |
| villa-exterior.jpg | Max Vakhtbovych | https://www.pexels.com/photo/a-beautiful-house-with-swimming-pool-8134746/ |
| apartment-living.jpg | Erdem ÖZDEMİR | https://www.pexels.com/photo/apartment-living-room-16056400/ |
| cabin-living.jpg | Ata Ebem | https://www.pexels.com/photo/interior-of-a-log-cabin-10761010/ |
| cabin-bedroom.jpg | fahri tokcan | https://www.pexels.com/photo/rustic-wooden-cabin-interior-with-cozy-bedroom-31790464/ |
| treehouse.jpg | Enric Cruz López | https://www.pexels.com/photo/wooden-house-on-tree-trunk-located-in-lush-forest-6272174/ |
| bedroom.jpg | Pixabay | https://www.pexels.com/photo/black-and-grey-bedspread-on-bed-and-pillow-164595/ |
| coffee.jpg | Esra Saltürk | https://www.pexels.com/photo/coffee-beans-on-a-wooden-table-with-a-cup-of-coffee-27548811/ |

Download URL pattern (replace ID with the source page's photo ID):
`https://images.pexels.com/photos/ID/pexels-photo-ID.jpeg?auto=compress&cs=tinysrgb&w=960&q=78`.
Files are JPEGs with a 960px width, CDN compression and quality 78. Images are
bundled locally for offline browsing; no third-party image requests occur at runtime.
Existing onboarding cover assets and the original Unsplash cabin/villa covers are
reused where appropriate. Gallery photos are reused across sample stays intentionally.
