type CategoryFormInitialValues = {
  name: string;
  description: string;
  imageUrl: string;
};

type CategoryFormFieldsProps = {
  initialValues: CategoryFormInitialValues;
};

const inputClass =
  "h-10 w-full rounded-xl bg-[#F3F4F6] px-3.5 text-sm text-text-heading outline-none transition-shadow placeholder:text-text-muted focus:ring-2 focus:ring-brand-primary";

const textareaClass =
  "w-full rounded-xl bg-[#F3F4F6] px-3.5 py-2.5 text-sm text-text-heading outline-none transition-shadow placeholder:text-text-muted focus:ring-2 focus:ring-brand-primary";

const labelClass = "text-sm font-medium text-text-heading";

export function CategoryFormFields({ initialValues }: CategoryFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="name" className={labelClass}>
          Category name
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

      <div className="grid gap-1.5">
        <label htmlFor="imageUrl" className={labelClass}>
          Image URL
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          defaultValue={initialValues.imageUrl}
          placeholder="/images/categories/ayam.jpg"
          className={inputClass}
        />
      </div>
    </div>
  );
}
