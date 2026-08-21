/** Mall product (渔具商城). */
export interface MallProduct {
  id: string;
  name: string;
  /** One-line spec, e.g. "2.1m · 7-18g · 快调". */
  spec: string;
  /** Category: 路亚竿 / 渔轮 / 假饵 / 台钓 / 配件. */
  category: string;
  /** Price in yuan. */
  price: number;
  /** Cumulative sold count. */
  sold: number;
  /** Corner flag: 新品 / 专场 / 热销, empty for none. */
  flag?: '新品' | '专场' | '热销';
}
