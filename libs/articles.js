import database from '#libs/database';

/**
 * Fetch article
 *
 * @param {number} id Article id
 * @returns {object|null} Article
 */

export const getArticleById = async (id) => {
  const query = `
  SELECT
    _id, module, title, date,
    text, image, imageSmall, imageDescription,
    pdf, pdfName, pdfTitle, web, author
  FROM
    Article
  WHERE
    _id = ?
  ORDER BY
    date DESC
  LIMIT
    1`;

  try {
    const [rows] = await database.execute(query, [id]);

    if (!rows.length) {
      return null;
    }

    let article = articleAdapter(rows[0]);
    article = await appendContent(article);
    return article;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/**
 * Fetch articles
 *
 * @param {number} id Module id
 * @returns {object[]|null} Articles
 */

export const getArticlesByModule = (id, limit = 500) => {
  const query = `
    SELECT
      _id, module, title, date,
      text, image, imageSmall, imageDescription,
      pdf, pdfName, pdfTitle, web, author
    FROM
      Article
    WHERE
      module = ? AND
      active = 1 AND
      date IS NOT NULL AND
      (archiveDate = 0 OR archiveDate > ?)
    ORDER BY
      date DESC
    LIMIT
      ?`;

  return new Promise(async (resolve) => {
    const [rows] = await database.execute(query, [id, Date.now(), limit]);

    if (!rows.length) {
      return resolve(null);
    }

    const articles = [];

    rows.forEach(async (article, index) => {
      article = articleAdapter(article);
      article = await appendContent(article);
      articles.push(article);

      if (rows.length === index + 1) {
        return resolve(articles);
      }
    });
  });
};

/**
 * Add content to article
 *
 * @param {object} article
 * @returns {object} enriched article
 */

const appendContent = async (article) => {
  const query = `
  SELECT _id, text, image, imageDescription, imageAlign
    FROM ArticleParagraph
      WHERE
        article = ?
  ORDER BY position`;

  try {
    const [content] = await database.execute(query, [article.id]);

    return {
      ...article,
      content: content.length ? content.map((c) => paragraphAdapter(c)) : null
    };
  } catch (error) {
    console.error(error);
    return error;
  }
};

/**
 * Remodel the structure of an article
 *
 * @param {object} a Article (from DB)
 * @returns {object} Remodled article
 */

const articleAdapter = (a) => {
  return {
    id: a._id,
    title: a.title,
    date: a.date,
    text: a.text || null,
    image: a.image
      ? {
          src: a.image || null,
          thumbSrc: a.imageSmall || null,
          alt: a.imageDescription || null
        }
      : null,
    pdf: a.pdf
      ? {
          src: a.pdf || null,
          name: a.pdfName || null,
          title: a.pdfTitle || null
        }
      : null,
    content: null,
    web: a.web || null,
    author: a.author || null
  };
};

/**
 * Remodel the structure of paragraphs
 *
 * @param {object[]} paragraphs List of paragraphs (from DB)
 * @returns {object} Restructured list of paragraphs
 */

export const paragraphAdapter = (p) => {
  return {
    id: p._id,
    text: p.text || null,
    image: p.image
      ? {
          src: p.image,
          alt: p.imageDescription || null,
          position: p.imageAlign || null
        }
      : null
  };
};
