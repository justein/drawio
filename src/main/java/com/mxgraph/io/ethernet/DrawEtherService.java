package com.mxgraph.io.ethernet;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.model.Filters;
import com.mxgraph.io.utils.MongoDBUtil;
import org.bson.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

/**
 * ${DESCRIPTION}
 * Package：com.mxgraph.io.ethernet
 *
 * @author Lyn
 * @create at 2018-01-17 15:03
 * @Description:
 * @CopyRight www.36588.com.cn
 **/
public class DrawEtherService {

    private static final String DEFAULT_DB_NAME = "novadraw";
    private static final String DEFAULT_COL_NAME = "drawdata";

    private MongoCollection<Document> coll;

    public DrawEtherService() {
        coll = MongoDBUtil.instance.getCollection(DEFAULT_DB_NAME, DEFAULT_COL_NAME);
    }

    public String storeDrawData(String fileName, String xmlData) {
         Document drawData = new Document();
        drawData.put("fileName", fileName);
        drawData.put("xmlData",xmlData);
        coll.insertOne(drawData);
        return null;
    }

    public String getDrawDataTest() {
        String fileName = "未命名表单";
        org.dom4j.Document xmlDom;
        String pureText = "";
        MongoCursor<Document> cursor1 = coll.find(Filters.eq("fileName", "未命名表单")).iterator();
        while (cursor1.hasNext()) {
            org.bson.Document _doc = (Document) cursor1.next();
            System.out.println(_doc.toString());
            //doc.toJson();
            try {
                xmlDom = DocumentHelper.parseText(_doc.get("xmlData").toString());
                Element root = xmlDom.getRootElement();
                pureText = root.elementText("diagram");
                System.out.println(pureText);

            } catch (DocumentException e) {
                e.printStackTrace();
            }

        }
        return pureText;
    }
}
