"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  categoryName: string;
  categoryImageUrl: string;
  priceOptions: PriceOptionForm[];
};

const createEmptyFormState = (): FormState => ({
  persianName: "",
  englishName: "",
  description: "",
  imageUrl: "",
  categoryName: "",
  categoryImageUrl: "",
  priceOptions: [{ label: "سایز", price: "" }],
});

const AdminMenuManager = () => {
  const [formState, setFormState] = useState<FormState>(createEmptyFormState);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingItemImage, setIsUploadingItemImage] = useState(false);
  const [isUploadingCategoryImage, setIsUploadingCategoryImage] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const updatePriceOption = (index: number, key: keyof PriceOptionForm, value: string) => {
    setFormState((prev) => ({
      ...prev,
      priceOptions: prev.priceOptions.map((option, idx) => (idx === index ? { ...option, [key]: value } : option)),
    }));
  };

  const addPriceOption = () => {
    setFormState((prev) => ({
      ...prev,
      priceOptions: [...prev.priceOptions, { label: "", price: "" }],
    }));
  };

  const removePriceOption = (index: number) => {
    setFormState((prev) => ({
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

  const handleItemImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingItemImage(true);
    try {
      const url = await uploadImage(file);
      setFormState((prev) => ({ ...prev, imageUrl: url }));
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

  const handleCategoryImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingCategoryImage(true);
    try {
      const url = await uploadImage(file);
      setFormState((prev) => ({ ...prev, categoryImageUrl: url }));
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

  const handleCreateItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const priceOptions = formState.priceOptions
        .map((option) => ({
          label: option.label.trim(),
          price: option.price ? Number(option.price) : NaN,
        }))
        .filter((option) => option.label && !Number.isNaN(option.price));

      if (!priceOptions.length) {
        throw new Error("حداقل یک گزینه قیمت‌گذاری معتبر وارد کنید.");
      }

      const payload = {
        persianName: formState.persianName,
        englishName: formState.englishName || undefined,
        description: formState.description || undefined,
        imageUrl: formState.imageUrl || undefined,
        categoryName: formState.categoryName || undefined,
        categoryImageUrl: formState.categoryImageUrl || undefined,
        priceOptions,
      };

      const response = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "ثبت آیتم ناموفق بود.");
      }

      toast({ title: "آیتم جدید اضافه شد." });
      setFormState(createEmptyFormState());
      await fetchMenu();
    } catch (error) {
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "ثبت آیتم ناموفق بود.",
      });
    } finally {
      setIsLoading(false);
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
                value={formState.persianName}
                onChange={handleInputChange}
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
                value={formState.englishName}
                onChange={handleInputChange}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="persian-text text-sm text-muted-foreground" htmlFor="categoryName">
                نام دسته‌بندی (در صورت نبود، ایجاد می‌شود)
              </label>
              <Input
                id="categoryName"
                name="categoryName"
                value={formState.categoryName}
                onChange={handleInputChange}
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
                {formState.categoryImageUrl ? (
                  <span className="text-xs text-muted-foreground break-all" dir="ltr">
                    {formState.categoryImageUrl}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">می‌توانید برای دسته‌بندی تصویر انتخاب کنید</span>
                )}
              </div>
              {formState.categoryImageUrl ? (
                <div className="h-20 w-20 overflow-hidden rounded-lg border border-border">
                  <Image
                    src={formState.categoryImageUrl}
                    alt="پیش‌نمایش دسته‌بندی"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="persian-text text-sm text-muted-foreground" htmlFor="description">
                توضیحات
              </label>
              <Textarea
                id="description"
                name="description"
                value={formState.description}
                onChange={handleInputChange}
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
                {formState.imageUrl ? (
                  <span className="text-xs text-muted-foreground break-all" dir="ltr">
                    {formState.imageUrl}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">فعلاً تصویری انتخاب نشده است</span>
                )}
              </div>
              {formState.imageUrl ? (
                <div className="h-24 w-24 overflow-hidden rounded-lg border border-border">
                  <Image
                    src={formState.imageUrl}
                    alt="پیش‌نمایش محصول"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formState.imageUrl}
                onChange={handleInputChange}
                placeholder="یا لینک دلخواه تصویر را وارد کنید"
                dir="ltr"
              />
            </div>
            <div className="md:col-span-2 space-y-3">
              <label className="persian-text text-sm text-muted-foreground">گزینه‌های قیمت‌گذاری</label>
              <div className="grid gap-3">
                {formState.priceOptions.map((option, index) => (
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
                        onChange={(event) => updatePriceOption(index, "price", event.target.value.replace(/[^0-9]/g, ""))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-destructive"
                        disabled={formState.priceOptions.length === 1}
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
              <Button className="persian-text" type="submit" disabled={isLoading}>
                {isLoading ? "در حال ثبت..." : "افزودن به منو"}
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
                      <div
                        key={item.id}
                        className="rounded-xl border border-border bg-card/60 p-4 shadow-sm"
                      >
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
