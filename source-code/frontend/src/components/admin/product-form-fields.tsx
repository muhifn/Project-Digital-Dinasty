type CategoryOption = {
  id: string;
  name: string;
};

type ProductFormInitialValues = {
  name: string;
  description: string;
  price: string;
  stock: string;
  unit: string;
  categoryId: string;
  lowStockThreshold: string;
  imageUrl: string;
  status: string;
};

type ProductFormFieldsProps = {
  categories: CategoryOption[];
  initialValues: ProductFormInitialValues;
  showCurrentImageHint?: boolean;
};

const inputClass =
  "h-10 w-full rounded-xl bg-[#F3F4F6] px-3.5 text-sm text-text-heading outline-none transition-shadow placeholder:text-text-muted focus:ring-2 focus:ring-brand-primary";

const selectClass =
  "h-10 w-full rounded-xl bg-[#F3F4F6] px-3.5 text-sm text-text-heading outline-none transition-shadow focus:ring-2 focus:ring-brand-primary";

const textareaClass =
  "w-full rounded-xl bg-[#F3F4F6] px-3.5 py-2.5 text-sm text-text-heading outline-none transition-shadow placeholder:text-text-muted focus:ring-2 focus:ring-brand-primary";

const labelClass = "text-sm font-medium text-text-heading";

export function ProductFormFields({
  categories,
  initialValues,
  showCurrentImageHint = false,
}: ProductFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="name" className={labelClass}>
          Product name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={initialValues.name}
          required
          className={inputClass}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initialValues.description}
          className={textareaClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="price" className={labelClass}>
            Price (IDR)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            step="1"
            defaultValue={initialValues.price}
            required
            className={inputClass}
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="stock" className={labelClass}>
            Stock quantity
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            step="1"
            defaultValue={initialValues.stock}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="unit" className={labelClass}>
            Unit
          </label>
          <input
            id="unit"
            name="unit"
            defaultValue={initialValues.unit}
            required
            className={inputClass}
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="lowStockThreshold" className={labelClass}>
            Low stock threshold
          </label>
          <input
            id="lowStockThreshold"
            name="lowStockThreshold"
            type="number"
            min={0}
            step="1"
            defaultValue={initialValues.lowStockThreshold}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="categoryId" className={labelClass}>
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={initialValues.categoryId}
          required
          className={selectClass}
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="imageUrl" className={labelClass}>
          Image URL
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          defaultValue={initialValues.imageUrl}
          placeholder="/images/products/your-image.jpg"
          className={inputClass}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="imageFile" className={labelClass}>
          Upload image file
        </label>
        <input
          id="imageFile"
          name="imageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="block w-full text-sm text-text-body file:mr-3 file:rounded-lg file:border-0 file:bg-brand-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-primary hover:file:bg-brand-accent/80"
        />
        <p className="text-xs text-text-muted">
          JPG, PNG, WEBP. Max 5MB. Uploaded file overrides Image URL.
        </p>
      </div>

      {showCurrentImageHint && initialValues.imageUrl ? (
        <div className="rounded-xl bg-[#F3F4F6] p-3 text-xs text-text-body">
          Current image:{" "}
          <span className="font-semibold text-text-heading">
            {initialValues.imageUrl}
          </span>
        </div>
      ) : null}

      <div className="rounded-xl bg-[#F3F4F6] p-3 text-xs text-text-body">
        Status is generated automatically from stock: 0 = OUT_OF_STOCK, above 0
        = AVAILABLE.
      </div>
    </div>
  );
}
