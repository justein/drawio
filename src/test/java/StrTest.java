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
 * Package：PACKAGE_NAME
 *
 * @author Lyn
 * @create at 2018-01-17 15:54
 * @Description:
 * @CopyRight www.36588.com.cn
 **/
public class StrTest {
    public static void main(String[] args) {
//        String s = "121232.xml";
//        System.out.println(s.substring(0,s.lastIndexOf(".")));

        String fileName = "未命名表单";
        org.dom4j.Document xmlDom;
        String pureText = "";
        MongoCollection<Document> coll = MongoDBUtil.instance.getCollection("novadraw", "drawdata");
        //Document doc = MongoDBUtil.instance.findById(coll,fileName);
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
    }
}
