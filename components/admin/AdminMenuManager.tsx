"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

type MenuItemOption = {
  id: number;
  label: string;
  price: number;
};

type MenuItem = {
  id: number;
  persianName: string;
  englishName?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  categoryId?: number | null;
  options: MenuItemOption[];
};

type MenuCategory = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  items: MenuItem[];
};

type MenuResponse = {
  categories: MenuCategory[];
};

type PriceOptionForm = {
  label: string;
  price: string;
};

type FormState = {
  persianName: string;
  englishName: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  priceOptions: PriceOptionForm[];
};

type CategoryFormState = {
  name: string;
  description: string;
  imageUrl: string;
};

const createEmptyItemForm = (overrides?: Partial<FormState>): FormState => ({
  persianName: "",
  englishName: "",
  description: "",
  imageUrl: "",
  categoryId: "",
  priceOptions: [{ label: "سایز", price: "" }],
  ...overrides,
});

const createEmptyCategoryForm = (): CategoryFormState => ({
  name: "",
  description: "",
  imageUrl: "",
});

const AdminMenuManager = () => {
  const [itemForm, setItemForm] = useState<FormState>(createEmptyItemForm());
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(createEmptyCategoryForm());
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isUploadingItemImage, setIsUploadingItemImage] = useState(false);
  const [isUploadingCategoryImage, setIsUploadingCategoryImage] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchMenu = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/menu", { method: "GET" });
      if (!response.ok) {
        throw new Error("خطا در دریافت منو");
      }
      const data = (await response.json()) as MenuResponse;
      setCategories(data.categories ?? []);
    } catch (error) {
      toast({
        title: "اشکال در دریافت منو",
        description: error instanceof Error ? error.message : "لطفاً دوباره تلاش کنید.",
      });
    } finally {
      setIsFetching(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const handleItemFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setItemForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const updatePriceOption = (index: number, key: keyof PriceOptionForm, value: string) => {
    setItemForm((prev) => ({
      ...prev,
      priceOptions: prev.priceOptions.map((option, idx) => (idx === index ? { ...option, [key]: value } : option)),
    }));
  };

  const addPriceOption = () => {
    setItemForm((prev) => ({
      ...prev,
      priceOptions: [...prev.priceOptions, { label: "", price: "" }],
    }));
  };

  const removePriceOption = (index: number) => {
    setItemForm((prev) => ({
      ...prev,
      priceOptions: prev.priceOptions.filter((_, idx) => idx !== index),
    }));
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("لطفاً فقط فایل تصویری انتخاب کنید.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error ?? "آپلود تصویر ناموفق بود.");
    }

    const { url } = (await response.json()) as { url: string };
    return url;
  };

  const handleItemImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingItemImage(true);
    try {
      const url = await uploadImage(file);
      setItemForm((prev) => ({ ...prev, imageUrl: url }));
      toast({ title: "تصویر محصول با موفقیت آپلود شد" });
    } catch (error) {
      toast({
        title: "خطا در آپلود",
        description: error instanceof Error ? error.message : "آپلود تصویر ناموفق بود.",
      });
    } finally {
      setIsUploadingItemImage(false);
      event.target.value = "";
    }
  };

  const handleCategoryImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingCategoryImage(true);
    try {
      const url = await uploadImage(file);
      setCategoryForm((prev) => ({ ...prev, imageUrl: url }));
      toast({ title: "تصویر دسته‌بندی با موفقیت آپلود شد" });
    } catch (error) {
      toast({
        title: "خطا در آپلود",
        description: error instanceof Error ? error.message : "آپلود تصویر ناموفق بود.",
      });
    } finally {
      setIsUploadingCategoryImage(false);
      event.target.value = "";
    }
  };

  const handleCreateCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) {
      toast({ title: "نام دسته‌بندی را وارد کنید." });
      return;
    }

    setIsCreatingCategory(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
          imageUrl: categoryForm.imageUrl || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "ثبت دسته‌بندی ناموفق بود.");
      }

      toast({ title: "دسته‌بندی جدید ساخته شد." });
      setCategoryForm(createEmptyCategoryForm());
      await fetchMenu();
    } catch (error) {
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "ثبت دسته‌بندی ناموفق بود.",
      });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    const category = categories.find((cat) => cat.id === id);
    if (!category) return;

    if (!window.confirm(`آیا از حذف دسته‌بندی «${category.name}» مطمئن هستید؟`)) return;

    setDeletingCategoryId(id);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "حذف دسته‌بندی ناموفق بود.");
      }

      toast({ title: "دسته‌بندی حذف شد." });
      await fetchMenu();
    } catch (error) {
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "حذف دسته‌بندی ناموفق بود.",
      });
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleCreateItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!itemForm.categoryId) {
      toast({ title: "لطفاً یک دسته‌بندی انتخاب کنید." });
      return;
    }

    const priceOptions = itemForm.priceOptions
      .map((option) => ({
        label: option.label.trim(),
        price: option.price ? Number(option.price) : NaN,
      }))
      .filter((option) => option.label && !Number.isNaN(option.price));

    if (!priceOptions.length) {
      toast({ title: "حداقل یک گزینه قیمت‌گذاری معتبر وارد کنید." });
      return;
    }

    setIsCreatingItem(true);
    try {
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persianName: itemForm.persianName,
          englishName: itemForm.englishName || undefined,
          description: itemForm.description || undefined,
          imageUrl: itemForm.imageUrl || undefined,
          categoryId: Number(itemForm.categoryId),
          priceOptions,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "ثبت آیتم ناموفق بود.");
      }

      toast({ title: "آیتم جدید اضافه شد." });
      setItemForm((prev) => createEmptyItemForm({ categoryId: prev.categoryId }));
      await fetchMenu();
    } catch (error) {
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "ثبت آیتم ناموفق بود.",
      });
    } finally {
      setIsCreatingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!window.confirm("آیا از حذف این آیتم مطمئن هستید؟")) return;
    try {
      const response = await fetch(`/api/menu/${itemId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("حذف آیتم ناموفق بود.");
      }
      toast({ title: "آیتم حذف شد." });
      await fetchMenu();
    } catch (error) {
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "حذف آیتم ناموفق بود.",
      });
    }
  };

  const allItems = useMemo(() => categories.flatMap((category) => category.items), [categories]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="persian-text text-xl">مدیریت دسته‌بندی‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleCreateCategory}>
            <div className="space-y-2">
              <label className="persian-text text-sm text-muted-foreground" htmlFor="category-name">
                نام دسته‌بندی *
              </label>
              <Input
                id="category-name"
                name="name"
                value={categoryForm.name}
                onChange={handleCategoryFieldChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="persian-text text-sm text-muted-foreground" htmlFor="category-description">
                توضیحات
              </label>
              <Input
                id="category-description"
                name="description"
                value={categoryForm.description}
                onChange={handleCategoryFieldChange}
              />
            </div>
            <div className="space-y-2">
              <span className="persian-text text-sm text-muted-foreground">تصویر دسته‌بندی</span>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" disabled={isUploadingCategoryImage}>
                  <label className="cursor-pointer">
                    <span>{isUploadingCategoryImage ? "در حال آپلود..." : "انتخاب تصویر"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCategoryImageUpload} />
                  </label>
                </Button>
                {categoryForm.imageUrl ? (
                  <span className="break-all text-xs text-muted-foreground" dir="ltr">
                    {categoryForm.imageUrl}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">اختیاری</span>
                )}
              </div>
              {categoryForm.imageUrl ? (
                <div className="h-20 w-20 overflow-hidden rounded-lg border border-border">
                  <Image
                    src={categoryForm.imageUrl}
                    alt="پیش‌نمایش دسته‌بندی"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <Button className="persian-text" type="submit" disabled={isCreatingCategory}>
                {isCreatingCategory ? "در حال ثبت..." : "افزودن دسته‌بندی"}
              </Button>
            </div>
          </form>

          <Separator />

          <div className="space-y-3">
            <h3 className="persian-text text-lg font-semibold">دسته‌بندی‌های موجود</h3>
            {categories.length === 0 ? (
              <p className="persian-text text-sm text-muted-foreground">هنوز دسته‌بندی‌ای ثبت نشده است.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {categories.map((category) => {
                  const itemCount = category.items.length;
                  const isDeleting = deletingCategoryId === category.id;
                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg border border-border bg-muted/40">
                          {category.imageUrl ? (
                            <Image
                              src={category.imageUrl}
                              alt={category.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                              {category.name.at(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="persian-text text-sm font-semibold text-foreground">{category.name}</p>
                          <p className="persian-text text-xs text-muted-foreground">{itemCount} محصول</p>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={itemCount > 0 || isDeleting}
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        {isDeleting ? "..." : "حذف"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="persian-text text-xs text-muted-foreground">
              برای حذف دسته‌بندی باید محصولات آن را حذف یا به دسته‌ای دیگر منتقل کنید.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="persian-text text-xl">افزودن محصول به منو</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleCreateItem}>
            <div className="space-y-2">
              <label className="persian-text text-sm text-muted-foreground" htmlFor="persianName">
                نام فارسی *
              </label>
              <Input
                id="persianName"
                name="persianName"
                value={itemForm.persianName}
                onChange={handleItemFieldChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="persian-text text-sm text-muted-foreground" htmlFor="englishName">
                نام انگلیسی
              </label>
              <Input
                id="englishName"
                name="englishName"
                value={itemForm.englishName}
                onChange={handleItemFieldChange}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="persian-text text-sm text-muted-foreground" htmlFor="categoryId">
                دسته‌بندی
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={itemForm.categoryId}
                onChange={handleItemFieldChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="" disabled>
                  انتخاب دسته‌بندی
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="persian-text text-sm text-muted-foreground" htmlFor="description">
                توضیحات
              </label>
              <Textarea
                id="description"
                name="description"
                value={itemForm.description}
                onChange={handleItemFieldChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <span className="persian-text text-sm text-muted-foreground">تصویر محصول</span>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" disabled={isUploadingItemImage}>
                  <label className="cursor-pointer">
                    <span>{isUploadingItemImage ? "در حال آپلود..." : "انتخاب تصویر"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleItemImageUpload} />
                  </label>
                </Button>
                {itemForm.imageUrl ? (
                  <span className="break-all text-xs text-muted-foreground" dir="ltr">
                    {itemForm.imageUrl}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">اختیاری</span>
                )}
              </div>
              {itemForm.imageUrl ? (
                <div className="h-24 w-24 overflow-hidden rounded-lg border border-border">
                  <Image
                    src={itemForm.imageUrl}
                    alt="پیش‌نمایش محصول"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="persian-text text-sm text-muted-foreground">گزینه‌های قیمت‌گذاری</label>
              <div className="grid gap-3">
                {itemForm.priceOptions.map((option, index) => (
                  <div key={index} className="grid gap-2 rounded-lg border border-dashed border-border p-3 md:grid-cols-2">
                    <Input
                      placeholder="مثلاً: کوچک، متوسط، بزرگ"
                      value={option.label}
                      onChange={(event) => updatePriceOption(index, "label", event.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="قیمت (ریال)"
                        value={option.price}
                        inputMode="numeric"
                        dir="ltr"
                        onChange={(event) =>
                          updatePriceOption(index, "price", event.target.value.replace(/[^0-9]/g, ""))
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive"
                        disabled={itemForm.priceOptions.length === 1}
                        onClick={() => removePriceOption(index)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" onClick={addPriceOption}>
                افزودن گزینه جدید
              </Button>
            </div>
            <div className="md:col-span-2">
              <Button className="persian-text" type="submit" disabled={isCreatingItem}>
                {isCreatingItem ? "در حال ثبت..." : "افزودن به منو"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="persian-text text-xl">لیست محصولات موجود در منو</CardTitle>
        </CardHeader>
        <CardContent>
          {isFetching ? (
            <p className="persian-text text-muted-foreground">در حال دریافت اطلاعات...</p>
          ) : allItems.length === 0 ? (
            <p className="persian-text text-muted-foreground">هنوز محصولی ثبت نشده است.</p>
          ) : (
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-xl border border-border bg-muted/40">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                          {category.name.at(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="persian-text text-lg font-semibold text-foreground">{category.name}</h3>
                      {category.description ? (
                        <p className="persian-text text-sm text-muted-foreground">{category.description}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border bg-card/60 p-4 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h4 className="persian-text text-lg font-semibold text-foreground">{item.persianName}</h4>
                            {item.englishName ? (
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.englishName}</p>
                            ) : null}
                            {item.description ? (
                              <p className="persian-text mt-2 text-sm text-muted-foreground">{item.description}</p>
                            ) : null}
                          </div>
                          <div className="space-y-2 text-left">
                            {item.options.length ? (
                              <div className="flex flex-wrap gap-2">
                                {item.options.map((option) => (
                                  <span key={option.id} className="price-badge rounded-full px-3 py-1 text-xs font-medium">
                                    {option.label}: {option.price.toLocaleString("fa-IR")} ریال
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="persian-text text-xs text-muted-foreground">گزینه قیمت‌گذاری ثبت نشده است.</span>
                            )}
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex justify-end">
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                            حذف
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMenuManager;
